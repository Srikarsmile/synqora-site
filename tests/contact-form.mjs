import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const staticFailures = [];
[
  "function ContactForm",
  "contact-form",
  "contact-submit",
  "Project type",
  "Website",
  "AI assistant",
  "Automation",
  "Internal tool",
  "Budget",
  "Timeline",
  "We reply within 24 hours",
  "contact-trust",
  "mailto:info@synqora.tech",
  "data-depth-stable",
  "backface-visibility: hidden",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    staticFailures.push(`Missing contact form token: ${token}`);
  }
});

[
  "brief-form",
  "AI AUDIT REQUEST",
  "Choose an audit area",
  "hello@synqora.ai",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    staticFailures.push(`Contact form should not bring back old audit UI: ${token}`);
  }
});

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { width: 1440, height: 900 },
});

const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.locator("#contact").scrollIntoViewIfNeeded();
await page.waitForTimeout(600);

const report = await page.evaluate(() => {
  const contact = document.querySelector("#contact");
  const form = document.querySelector("#contact .contact-form");
  const copy = document.querySelector("#contact .screen-copy");
  const fields = [...document.querySelectorAll("#contact input, #contact textarea, #contact select")];
  const submit = document.querySelector("#contact .contact-submit");
  const contactRect = contact?.getBoundingClientRect();
  const formRect = form?.getBoundingClientRect();
  const copyRect = copy?.getBoundingClientRect();
  const submitStyle = submit ? getComputedStyle(submit) : null;
  const firstFieldStyle = fields[0] ? getComputedStyle(fields[0]) : null;
  const trust = document.querySelector("#contact .contact-trust");
  const trustRect = trust?.getBoundingClientRect();

  return {
    action: form?.getAttribute("action") ?? "",
    copyLeft: copyRect ? Math.round(copyRect.left) : -1,
    fieldCount: fields.length,
    firstFieldBackground: firstFieldStyle?.backgroundColor ?? "",
    firstFieldColor: firstFieldStyle?.color ?? "",
    firstFieldRadius: firstFieldStyle?.borderRadius ?? "",
    formAria: form?.getAttribute("aria-label") ?? "",
    formLeft: formRect ? Math.round(formRect.left) : -1,
    formPosition: form ? getComputedStyle(form).position : "",
    formRight: formRect ? Math.round(formRect.right) : -1,
    formTop: formRect ? Math.round(formRect.top - (contactRect?.top ?? 0)) : -1,
    formTransform: form ? getComputedStyle(form).transform : "",
    visibleEmailCount: document.querySelectorAll("#contact .email-link").length,
    hasMessage: Boolean(document.querySelector("#contact textarea[name='message']")),
    method: form?.getAttribute("method") ?? "",
    submitText: submit?.textContent?.trim() ?? "",
    trustText: trust?.textContent?.trim() ?? "",
    trustVisible: Boolean(trustRect && trustRect.width > 40 && trustRect.height > 12),
    submitRadius: submitStyle?.borderRadius ?? "",
    stableDepth: contact?.getAttribute("data-depth-stable") ?? "",
    formBackface: form ? getComputedStyle(form).backfaceVisibility : "",
    formContain: form ? getComputedStyle(form).contain : "",
    viewportWidth: window.innerWidth,
  };
});

const stabilityReport = await page.evaluate(async () => {
  const form = document.querySelector("#contact .contact-form");
  if (!form) return { samples: [], topDrift: -1, leftDrift: -1, minOpacity: -1 };

  const samples = [];
  for (let index = 0; index < 16; index += 1) {
    const rect = form.getBoundingClientRect();
    const style = getComputedStyle(form);
    samples.push({
      left: rect.left,
      opacity: Number(style.opacity),
      top: rect.top,
    });
    await new Promise((resolveFrame) => requestAnimationFrame(resolveFrame));
  }

  const tops = samples.map((sample) => sample.top);
  const lefts = samples.map((sample) => sample.left);
  return {
    samples,
    topDrift: Math.max(...tops) - Math.min(...tops),
    leftDrift: Math.max(...lefts) - Math.min(...lefts),
    minOpacity: Math.min(...samples.map((sample) => sample.opacity)),
  };
});

const entryReport = await page.evaluate(async () => {
  const contact = document.querySelector("#contact");
  const form = document.querySelector("#contact .contact-form");
  if (!contact || !form) {
    return {
      visibleSamples: [],
      minVisibleOpacity: -1,
      unstableBackdropVariables: [],
      unstableTransforms: [],
    };
  }

  window.scrollTo({ top: window.innerHeight * 4, behavior: "auto" });
  await new Promise((resolve) => setTimeout(resolve, 260));
  window.scrollTo({ top: window.innerHeight * 5, behavior: "smooth" });

  const samples = [];
  for (let index = 0; index < 72; index += 1) {
    const rect = form.getBoundingClientRect();
    const style = getComputedStyle(form);
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    if (visibleHeight > 24) {
      const contactStyle = getComputedStyle(contact);
      samples.push({
        ambientOpacity: contactStyle.getPropertyValue("--screen-ambient-opacity").trim(),
        depthOpacity: contactStyle.getPropertyValue("--depth-field-opacity").trim(),
        gradientOpacity: contactStyle.getPropertyValue("--screen-gradient-opacity").trim(),
        opacity: Number(style.opacity),
        transform: style.transform,
        visibleHeight: Math.round(visibleHeight),
      });
    }
    await new Promise((resolveFrame) => requestAnimationFrame(resolveFrame));
  }

  const firstTransform = samples[0]?.transform ?? "";
  const firstBackdropKey = samples[0]
    ? `${samples[0].gradientOpacity}|${samples[0].ambientOpacity}|${samples[0].depthOpacity}`
    : "";
  return {
    visibleSamples: samples.slice(0, 8),
    minVisibleOpacity: Math.min(...samples.map((sample) => sample.opacity)),
    unstableBackdropVariables: samples
      .filter((sample) => `${sample.gradientOpacity}|${sample.ambientOpacity}|${sample.depthOpacity}` !== firstBackdropKey)
      .slice(0, 4)
      .map((sample) => ({
        ambientOpacity: sample.ambientOpacity,
        depthOpacity: sample.depthOpacity,
        gradientOpacity: sample.gradientOpacity,
      })),
    unstableTransforms: samples
      .filter((sample) => sample.transform !== firstTransform)
      .slice(0, 4)
      .map((sample) => sample.transform),
  };
});

await page.locator("#contact").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);

const visualStabilityReport = await page.evaluate(() => {
  const form = document.querySelector("#contact .contact-form");
  if (!form) return null;

  const rect = form.getBoundingClientRect();
  return {
    clip: {
      height: Math.ceil(rect.height + 24),
      width: Math.ceil(rect.width + 24),
      x: Math.max(0, Math.floor(rect.left - 12)),
      y: Math.max(0, Math.floor(rect.top - 12)),
    },
  };
});

let contactVisualByteDiff = -1;
if (visualStabilityReport?.clip) {
  const firstFrame = await page.screenshot({ clip: visualStabilityReport.clip });
  await page.waitForTimeout(320);
  const secondFrame = await page.screenshot({ clip: visualStabilityReport.clip });
  contactVisualByteDiff = 0;
  for (let index = 0; index < Math.min(firstFrame.length, secondFrame.length); index += 1) {
    if (firstFrame[index] !== secondFrame[index]) contactVisualByteDiff += 1;
  }
}

await browser.close();

const failures = [...staticFailures];
const colorChannels = (color) => {
  const channels = color.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number) ?? [];
  return channels.length === 3 ? channels : [255, 255, 255];
};
const isDarkText = (color) => {
  const [r, g, b] = colorChannels(color);
  return r < 70 && g < 70 && b < 70;
};
const alphaChannel = (color) => {
  const channels = color.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  return channels.length >= 4 ? channels[3] : 1;
};

if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.formAria !== "Start a Synqora build") failures.push(`Contact form needs a clear aria-label: ${report.formAria}.`);
if (report.action !== "mailto:info@synqora.tech") failures.push(`Contact form should submit to Synqora email: ${report.action}.`);
if (report.method.toLowerCase() !== "post") failures.push(`Contact form should use post for mail client payload: ${report.method}.`);
if (report.fieldCount < 6) failures.push(`Contact form should collect useful detail with 6 fields, got ${report.fieldCount}.`);
if (!report.hasMessage) failures.push("Contact form should include a message textarea.");
if (report.submitText !== "Send enquiry") failures.push(`Submit copy should be direct: ${report.submitText}.`);
if (!report.trustText.includes("We reply within 24 hours") || !report.trustVisible) {
  failures.push(`Contact form should show a response-time reassurance: ${JSON.stringify(report)}.`);
}
if (!isDarkText(report.firstFieldColor)) failures.push(`Contact form field text should be dark: ${report.firstFieldColor}.`);
if (alphaChannel(report.firstFieldBackground) < 0.72) {
  failures.push(`Contact fields should be opaque enough to stop background shimmer: ${report.firstFieldBackground}.`);
}
if (parseFloat(report.firstFieldRadius) < 14) failures.push(`Contact fields should have Apple-style rounded corners: ${report.firstFieldRadius}.`);
if (parseFloat(report.submitRadius) < 18) failures.push(`Submit button should have a soft Apple-style radius: ${report.submitRadius}.`);
if (report.formLeft < 24 || report.formLeft > report.viewportWidth * 0.2) {
  failures.push(`Contact form should occupy the empty left side without clipping: left=${report.formLeft}.`);
}
if (report.formRight > report.viewportWidth * 0.52) failures.push(`Contact form should not collide with the right copy: right=${report.formRight}.`);
if (report.copyLeft - report.formRight < 144) {
  failures.push(`Contact copy should stay clearly separated from the form: formRight=${report.formRight}, copyLeft=${report.copyLeft}.`);
}
if (report.formTop < 160 || report.formTop > 420) failures.push(`Contact form should sit vertically centered in the open area: top=${report.formTop}.`);
if (report.formPosition !== "relative" || report.formTransform !== "none") {
  failures.push(`Contact form should be a stable grid item, not an absolute translated overlay: ${report.formPosition}, ${report.formTransform}.`);
}
if (report.visibleEmailCount !== 0) failures.push(`Contact screen should not show the email beside the form: ${report.visibleEmailCount}.`);
if (report.stableDepth !== "true") failures.push(`Contact screen should opt into stable depth rendering: ${report.stableDepth}.`);
if (report.formBackface !== "hidden") failures.push(`Contact form should hide backface during sticky layer promotion: ${report.formBackface}.`);
if (
  report.formContain !== "content"
  && (!report.formContain.includes("layout") || !report.formContain.includes("paint"))
) {
  failures.push(`Contact form should isolate layout/paint to prevent flicker: ${report.formContain}.`);
}
if (stabilityReport.minOpacity < 0.98) failures.push(`Contact form opacity should stay stable after settling: ${stabilityReport.minOpacity}.`);
if (stabilityReport.topDrift > 1 || stabilityReport.leftDrift > 1) {
  failures.push(`Contact form should not drift after settling: top=${stabilityReport.topDrift.toFixed(2)}, left=${stabilityReport.leftDrift.toFixed(2)}.`);
}
if (entryReport.minVisibleOpacity < 0.98) {
  failures.push(`Contact form should not fade in while entering the viewport: ${JSON.stringify(entryReport)}.`);
}
if (entryReport.unstableTransforms.length > 0) {
  failures.push(`Contact form transform should stay stable while entering the viewport: ${JSON.stringify(entryReport)}.`);
}
if (entryReport.unstableBackdropVariables.length > 0) {
  failures.push(`Contact backdrop variables should not change while the form is visible: ${JSON.stringify(entryReport)}.`);
}
if (contactVisualByteDiff > 800) {
  failures.push(`Contact form crop should not visually flicker while idle: ${contactVisualByteDiff} changed PNG bytes.`);
}

if (failures.length > 0) {
  throw new Error(`Contact form failed:\n${failures.join("\n")}\n\n${JSON.stringify({ report, stabilityReport, entryReport, contactVisualByteDiff }, null, 2)}`);
}

console.log(`Contact form passed: ${report.fieldCount} fields at ${report.formLeft}-${report.formRight}.`);

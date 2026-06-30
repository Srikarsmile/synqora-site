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
  "mailto:info@synqora.tech",
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

  return {
    action: form?.getAttribute("action") ?? "",
    copyLeft: copyRect ? Math.round(copyRect.left) : -1,
    fieldCount: fields.length,
    firstFieldColor: firstFieldStyle?.color ?? "",
    firstFieldRadius: firstFieldStyle?.borderRadius ?? "",
    formAria: form?.getAttribute("aria-label") ?? "",
    formLeft: formRect ? Math.round(formRect.left) : -1,
    formRight: formRect ? Math.round(formRect.right) : -1,
    formTop: formRect ? Math.round(formRect.top - (contactRect?.top ?? 0)) : -1,
    visibleEmailCount: document.querySelectorAll("#contact .email-link").length,
    hasMessage: Boolean(document.querySelector("#contact textarea[name='message']")),
    method: form?.getAttribute("method") ?? "",
    submitText: submit?.textContent?.trim() ?? "",
    submitRadius: submitStyle?.borderRadius ?? "",
    viewportWidth: window.innerWidth,
  };
});

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

if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.formAria !== "Start a Synqora build") failures.push(`Contact form needs a clear aria-label: ${report.formAria}.`);
if (report.action !== "mailto:info@synqora.tech") failures.push(`Contact form should submit to Synqora email: ${report.action}.`);
if (report.method.toLowerCase() !== "post") failures.push(`Contact form should use post for mail client payload: ${report.method}.`);
if (report.fieldCount < 6) failures.push(`Contact form should collect useful detail with 6 fields, got ${report.fieldCount}.`);
if (!report.hasMessage) failures.push("Contact form should include a message textarea.");
if (report.submitText !== "Send enquiry") failures.push(`Submit copy should be direct: ${report.submitText}.`);
if (!isDarkText(report.firstFieldColor)) failures.push(`Contact form field text should be dark: ${report.firstFieldColor}.`);
if (parseFloat(report.firstFieldRadius) < 14) failures.push(`Contact fields should have Apple-style rounded corners: ${report.firstFieldRadius}.`);
if (parseFloat(report.submitRadius) < 18) failures.push(`Submit button should have a soft Apple-style radius: ${report.submitRadius}.`);
if (report.formLeft > report.viewportWidth * 0.2) failures.push(`Contact form should occupy the empty left side: left=${report.formLeft}.`);
if (report.formRight > report.viewportWidth * 0.52) failures.push(`Contact form should not collide with the right copy: right=${report.formRight}.`);
if (report.copyLeft < report.viewportWidth * 0.52) failures.push(`Contact copy should stay on the right side: left=${report.copyLeft}.`);
if (report.formTop < 160 || report.formTop > 420) failures.push(`Contact form should sit vertically centered in the open area: top=${report.formTop}.`);
if (report.visibleEmailCount !== 0) failures.push(`Contact screen should not show the email beside the form: ${report.visibleEmailCount}.`);

if (failures.length > 0) {
  throw new Error(`Contact form failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Contact form passed: ${report.fieldCount} fields at ${report.formLeft}-${report.formRight}.`);

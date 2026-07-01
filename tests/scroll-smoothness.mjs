import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const failures = [];

[
  "function DepthScrollController",
  "data-depth-scroll",
  "Element.prototype.scrollIntoView",
  "scrollTarget",
  "scrollCurrent",
  "velocityDamping",
  "--screen-copy-opacity",
  "--screen-distance",
  "--depth-scroll-current",
  "position: sticky",
  "scroll-snap-align",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    failures.push(`Native section scroll should not keep brittle depth-scroll token: ${token}`);
  }
});

[
  "height: var(--screen-height)",
  "#contact.text-screen",
  ".contact-form",
  ".site-crowd-footer",
  "scroll-snap-type: none",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    failures.push(`Missing native full-screen scroll token: ${token}`);
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
await page.waitForTimeout(700);

const layoutReport = await page.evaluate(() => {
  const screens = [...document.querySelectorAll(".text-screen")];
  const footer = document.querySelector(".site-crowd-footer");

  return {
    footerPosition: footer ? getComputedStyle(footer).position : "",
    rootDataset: document.documentElement.dataset.depthScroll ?? "",
    rootSnapType: getComputedStyle(document.documentElement).scrollSnapType,
    screenHeights: screens.map((screen) => Math.round(screen.getBoundingClientRect().height)),
    screenPositions: screens.map((screen) => getComputedStyle(screen).position),
    viewportHeight: window.innerHeight,
  };
});

await page.locator(".site-crowd-footer").scrollIntoViewIfNeeded();
await page.waitForTimeout(350);
await page.evaluate(() => {
  document.getElementById("contact")?.scrollIntoView({ block: "start", behavior: "smooth" });
});
await page.waitForTimeout(1000);

const contactReport = await page.evaluate(() => {
  const contact = document.querySelector("#contact");
  const form = document.querySelector("#contact .contact-form");
  const copy = document.querySelector("#contact .screen-copy");
  const rectOf = (element) => {
    const rect = element?.getBoundingClientRect();
    return rect
      ? {
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
      }
      : null;
  };

  return {
    contact: rectOf(contact),
    copy: rectOf(copy),
    copyOpacity: copy ? Number(getComputedStyle(copy).opacity) : 0,
    form: rectOf(form),
    formOpacity: form ? Number(getComputedStyle(form).opacity) : 0,
    ownerAtCenter: document.elementFromPoint(
      Math.round(window.innerWidth / 2),
      Math.round(window.innerHeight / 2),
    )?.closest(".text-screen, .site-crowd-footer")?.id ?? "",
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  };
});

await browser.close();

if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (layoutReport.rootDataset) failures.push(`Root should not expose depth-scroll state: ${layoutReport.rootDataset}.`);
if (layoutReport.rootSnapType !== "none") failures.push(`Root scroll snap should stay disabled: ${layoutReport.rootSnapType}.`);
if (layoutReport.screenPositions.some((position) => position !== "relative")) {
  failures.push(`Text screens should be normal flow sections: ${layoutReport.screenPositions.join(", ")}.`);
}
if (layoutReport.screenHeights.some((height) => Math.abs(height - layoutReport.viewportHeight) > 2)) {
  failures.push(`Every text screen should cover one viewport: ${JSON.stringify(layoutReport)}.`);
}
if (layoutReport.footerPosition !== "relative") {
  failures.push(`Footer should be a normal flow section: ${layoutReport.footerPosition}.`);
}
if (!contactReport.contact || Math.abs(contactReport.contact.top) > 4) {
  failures.push(`Contact should scroll back to the top cleanly: ${JSON.stringify(contactReport)}.`);
}
if (!contactReport.form || contactReport.form.width < 300 || contactReport.form.bottom <= 0 || contactReport.form.top >= contactReport.viewportHeight) {
  failures.push(`Contact form should remain visible after scrolling back from footer: ${JSON.stringify(contactReport)}.`);
}
if (!contactReport.copy || contactReport.copy.width < 320 || contactReport.copy.bottom <= 0 || contactReport.copy.top >= contactReport.viewportHeight) {
  failures.push(`Contact copy should remain visible after scrolling back from footer: ${JSON.stringify(contactReport)}.`);
}
if (contactReport.formOpacity < 0.98 || contactReport.copyOpacity < 0.98) {
  failures.push(`Contact content should not fade or park: ${JSON.stringify(contactReport)}.`);
}
if (contactReport.ownerAtCenter !== "contact") {
  failures.push(`Viewport center should belong to contact after footer-to-contact scroll: ${JSON.stringify(contactReport)}.`);
}

if (failures.length > 0) {
  throw new Error(`Scroll smoothness failed:\n${failures.join("\n")}\n\n${JSON.stringify({ layoutReport, contactReport }, null, 2)}`);
}

console.log("Native full-screen scroll passed; contact stays visible after footer return.");

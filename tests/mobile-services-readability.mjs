import { chromium } from "playwright";

const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 3,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.locator("#services").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);

const report = await page.evaluate(() => {
  const rectOf = (selector) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
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
  const chips = [...document.querySelectorAll("#services .service-focus-item")].map((chip) => {
    const rect = chip.getBoundingClientRect();
    return {
      bottom: Math.round(rect.bottom),
      text: chip.textContent?.trim() ?? "",
      top: Math.round(rect.top),
      visible: rect.width > 20 && rect.height > 20,
    };
  });
  const title = document.querySelector("#services .screen-title");
  const copy = document.querySelector("#services .screen-copy-line");

  return {
    chips,
    copy: rectOf("#services .screen-copy-line"),
    copyFontSize: Number.parseFloat(copy ? getComputedStyle(copy).fontSize : "0"),
    screen: rectOf("#services"),
    title: rectOf("#services .screen-title"),
    titleFontSize: Number.parseFloat(title ? getComputedStyle(title).fontSize : "0"),
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  };
});

await browser.close();

const failures = [];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (!report.screen || Math.abs(report.screen.height - report.viewportHeight) > 2) {
  failures.push(`Services screen should own exactly one mobile viewport: ${JSON.stringify(report.screen)}.`);
}
if (!report.title || report.title.height > 500) {
  failures.push(`Services heading is too squeezed/tall on mobile: ${JSON.stringify(report)}.`);
}
if (!report.copy || report.copy.bottom > report.viewportHeight - 122) {
  failures.push(`Services supporting copy should remain above mobile browser controls: ${JSON.stringify(report)}.`);
}
if (report.chips.length !== 3 || report.chips.some((chip) => !chip.visible)) {
  failures.push(`Services chips should remain visible: ${JSON.stringify(report.chips)}.`);
}
if (report.chips.some((chip) => chip.bottom > report.viewportHeight - 42)) {
  failures.push(`Services chips should not sit under the bottom browser chrome: ${JSON.stringify(report.chips)}.`);
}

if (failures.length > 0) {
  throw new Error(`Mobile services readability failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log("Mobile services readability passed.");

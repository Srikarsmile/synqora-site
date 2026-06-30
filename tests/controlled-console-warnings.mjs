import { chromium } from "playwright";

const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { width: 1440, height: 900 },
});

const warnings = [];
page.on("console", (message) => {
  if (message.type() === "warning") {
    warnings.push(message.text());
  }
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(2600);
await browser.close();

const controlledWarningPatterns = [
  /GSAP target .* not found/,
  /preloaded using link preload but not used/,
];
const failures = warnings.filter((warning) => (
  controlledWarningPatterns.some((pattern) => pattern.test(warning))
));

if (failures.length > 0) {
  throw new Error(`Controlled console warnings found:\n${failures.join("\n")}`);
}

console.log("Controlled console warnings clean: no stale GSAP targets or unused hero preload.");

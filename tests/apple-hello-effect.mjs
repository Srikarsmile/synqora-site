import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const failures = [];
[
  "function AppleHelloEffect",
  "APPLE_HELLO_SEEN_KEY",
  "apple-hello-effect",
  "apple-hello-word",
  "data-hello-source=\"@ncdai/apple-hello-effect\"",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    failures.push(`Intro loading overlay token should be removed: ${token}`);
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
await page.evaluate(() => window.sessionStorage.clear());
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(120);

const firstPaint = await page.evaluate(() => {
  const hero = document.querySelector("#hero");
  const title = document.querySelector("#hero .screen-title");
  const overlayCount = document.querySelectorAll(".apple-hello-effect, .loading-screen, [data-loading-screen]").length;
  const heroRect = hero?.getBoundingClientRect();
  const titleStyle = title ? getComputedStyle(title) : null;

  return {
    heroVisible: Boolean(heroRect && heroRect.width > 0 && heroRect.height > 0),
    overlayCount,
    titleText: title?.textContent?.trim() ?? "",
    titleOpacity: Number(titleStyle?.opacity ?? 0),
  };
});

await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(120);

const refreshPaint = await page.evaluate(() => ({
  overlayCount: document.querySelectorAll(".apple-hello-effect, .loading-screen, [data-loading-screen]").length,
  titleText: document.querySelector("#hero .screen-title")?.textContent?.trim() ?? "",
}));

await browser.close();

if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (firstPaint.overlayCount !== 0) failures.push(`No intro overlay should mount on first visit: ${JSON.stringify(firstPaint)}.`);
if (!firstPaint.heroVisible) failures.push(`Hero should be visible immediately: ${JSON.stringify(firstPaint)}.`);
if (firstPaint.titleText !== "Websites and AI systems.") {
  failures.push(`Hero title should render immediately: ${JSON.stringify(firstPaint)}.`);
}
if (firstPaint.titleOpacity < 0.95) {
  failures.push(`Hero title should not be hidden behind an intro state: ${JSON.stringify(firstPaint)}.`);
}
if (refreshPaint.overlayCount !== 0) failures.push(`No intro overlay should mount after refresh: ${JSON.stringify(refreshPaint)}.`);
if (refreshPaint.titleText !== "Websites and AI systems.") {
  failures.push(`Hero title should still render immediately after refresh: ${JSON.stringify(refreshPaint)}.`);
}

if (failures.length > 0) {
  throw new Error(`No intro loading screen failed:\n${failures.join("\n")}`);
}

console.log("No intro loading screen passed.");

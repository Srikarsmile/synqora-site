import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const expectedFiles = [
  "public/fonts/helvetica-neue/HelveticaNeueRoman.otf",
  "public/fonts/helvetica-neue/HelveticaNeueMedium.otf",
  "public/fonts/helvetica-neue/HelveticaNeueBold.otf",
  "public/fonts/helvetica-neue/HelveticaNeueHeavy.otf",
];

const failures = [];
[
  "@font-face",
  "Helvetica Neue Synqora",
  "/fonts/helvetica-neue/HelveticaNeueRoman.otf",
  "/fonts/helvetica-neue/HelveticaNeueMedium.otf",
  "/fonts/helvetica-neue/HelveticaNeueBold.otf",
  "/fonts/helvetica-neue/HelveticaNeueHeavy.otf",
  "font-display: swap",
].forEach((token) => {
  if (!css.includes(token)) failures.push(`Missing Helvetica Neue CSS token: ${token}`);
});

expectedFiles.forEach((file) => {
  if (!existsSync(resolve(root, file))) failures.push(`Missing hosted font file: ${file}`);
});

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: "networkidle" });

const report = await page.evaluate(() => {
  const body = getComputedStyle(document.body);
  const title = getComputedStyle(document.querySelector(".screen-title"));
  return {
    bodyFamily: body.fontFamily,
    titleFamily: title.fontFamily,
  };
});

await browser.close();

if (!report.bodyFamily.includes("Helvetica Neue Synqora")) {
  failures.push(`Body should use hosted Helvetica Neue first: ${report.bodyFamily}.`);
}
if (!report.titleFamily.includes("Helvetica Neue Synqora")) {
  failures.push(`Display type should use hosted Helvetica Neue first: ${report.titleFamily}.`);
}

if (failures.length > 0) {
  throw new Error(`Helvetica font setup failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Helvetica font setup passed: ${report.titleFamily}.`);

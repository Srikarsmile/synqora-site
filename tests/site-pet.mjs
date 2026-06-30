import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const forbiddenTokens = [
  "function SitePet",
  "<SitePet",
  "site-pet",
  "site-pet-sprite",
  "site-pet-frame",
  "data-site-pet-source",
  "Pet Synqora site companion",
  "synqora-pet-sprite.svg",
  "activePetAlign",
  "movementTimer",
  "alignTimer",
];

const staticFailures = forbiddenTokens
  .filter((token) => app.includes(token) || css.includes(token))
  .map((token) => `Pet should be disabled, found token: ${token}`);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const report = await page.evaluate(() => ({
  petCount: document.querySelectorAll(".site-pet, .site-pet-sprite, [data-site-pet-source]").length,
  petAssetUsed: [...document.querySelectorAll("*")].some((element) => getComputedStyle(element).backgroundImage.includes("synqora-pet-sprite")),
}));

await browser.close();

const failures = [...staticFailures];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.petCount !== 0) failures.push(`No site pet elements should render: ${report.petCount}.`);
if (report.petAssetUsed) failures.push("Pet sprite asset should not be used in runtime styles.");

if (failures.length > 0) {
  throw new Error(`Site pet disabled check failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log("Site pet disabled check passed: no pet runtime surface.");

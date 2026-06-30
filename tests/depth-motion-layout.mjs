import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const staticFailures = [];
[
  "function DepthMotionField",
  "depth-motion-field",
  "depth-motion-plane",
  "depth-motion-orbit",
  "depth-motion-node",
  "perspective:",
  "rotateX",
  "translate3d",
  "depth-gallery-drift",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    staticFailures.push(`Missing depth-motion token: ${token}`);
  }
});

[
  "framer-motion",
  "useScroll",
  "useTransform",
  'addEventListener("scroll"',
  "requestAnimationFrame(render)",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    staticFailures.push(`Depth motion should stay compositor/CSS-driven, found: ${token}`);
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
await page.waitForTimeout(1000);

const report = await page.evaluate(() => {
  const screens = [...document.querySelectorAll(".text-screen")];
  const fields = [...document.querySelectorAll(".depth-motion-field")];
  return {
    fieldCount: fields.length,
    hasImages: Boolean(document.querySelector(".depth-motion-field img, .depth-motion-field picture, .depth-motion-field canvas")),
    screens: screens.map((screen) => {
      const field = screen.querySelector(".depth-motion-field");
      const planes = field ? [...field.querySelectorAll(".depth-motion-plane")] : [];
      const fieldStyle = field ? getComputedStyle(field) : null;
      return {
        align: screen.getAttribute("data-align"),
        field: Boolean(field),
        perspective: fieldStyle?.perspective ?? "",
        planeCount: planes.length,
        sampleTransform: planes[0] ? getComputedStyle(planes[0]).transform : "",
        title: screen.querySelector(".screen-title")?.textContent?.trim() ?? "",
      };
    }),
    viewTimeline: CSS.supports("animation-timeline: view()"),
  };
});

await browser.close();

const failures = [...staticFailures];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.fieldCount !== report.screens.length) {
  failures.push(`Expected one depth field per screen: ${report.fieldCount}/${report.screens.length}.`);
}
if (report.hasImages) failures.push("Depth motion field should not reintroduce image/canvas surfaces.");
report.screens.forEach((screen, index) => {
  if (!screen.field) failures.push(`Screen ${index + 1} is missing a depth field.`);
  if (screen.planeCount < 3) failures.push(`Screen ${index + 1} needs at least 3 depth planes, found ${screen.planeCount}.`);
  if (!screen.perspective || screen.perspective === "none") failures.push(`Screen ${index + 1} depth field has no perspective.`);
  if (!screen.sampleTransform || screen.sampleTransform === "none") failures.push(`Screen ${index + 1} depth planes are not transformed.`);
});

if (failures.length > 0) {
  throw new Error(`Depth motion layout failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Depth motion layout passed: ${report.fieldCount} CSS-driven depth fields.`);

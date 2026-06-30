import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const staticFailures = [];
[
  "data-align",
  "text-screen",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    staticFailures.push(`Missing screen layout token: ${token}`);
  }
});

[
  "const flowPathPoints",
  "const flowMainPath",
  "function FlowLine",
  "flow-line-layer",
  "flow-main-path",
  "flow-progress-path",
  "flow-runner",
  "animateMotion",
  "flow-branch",
  "flow-start-marker",
  "data-flow-start",
  "framer-motion",
  "useScroll",
  "useTransform",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    staticFailures.push(`Flow line should be removed, found: ${token}`);
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
  const branches = [...document.querySelectorAll(".flow-branch")];
  const lineLayer = document.querySelector(".flow-line-layer");
  const mainPath = document.querySelector(".flow-main-path");
  const progressPath = document.querySelector(".flow-progress-path");
  const runners = [...document.querySelectorAll(".flow-runner")];
  const animateMotion = [...document.querySelectorAll(".flow-runner animateMotion")];
  const startMarker = document.querySelector(".flow-start-marker");

  return {
    branchCount: branches.length,
    hasLineLayer: Boolean(lineLayer),
    hasMainPath: Boolean(mainPath),
    hasProgressPath: Boolean(progressPath),
    runnerCount: runners.length,
    runnerAnimations: animateMotion.length,
    hasStartMarker: Boolean(startMarker),
    screenCount: screens.length,
    screens: screens.map((screen, index) => {
      const copy = screen.querySelector(".screen-copy");
      const copyRect = copy?.getBoundingClientRect();
      const align = screen.getAttribute("data-align");
      return {
        align,
        centerX: copyRect ? Math.round(copyRect.left + copyRect.width / 2) : 0,
        index,
        title: screen.querySelector(".screen-title")?.textContent?.trim() ?? "",
      };
    }),
    viewportWidth: window.innerWidth,
  };
});

await browser.close();

const failures = [...staticFailures];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.hasLineLayer) failures.push("Rendered flow line layer should be removed.");
if (report.hasMainPath) failures.push("Rendered main flow path should be removed.");
if (report.hasProgressPath) failures.push("Rendered progress flow path should be removed.");
if (report.runnerCount > 0) failures.push(`Animated flow runners should be removed, found ${report.runnerCount}.`);
if (report.runnerAnimations > 0) failures.push(`animateMotion should be removed, found ${report.runnerAnimations}.`);
if (report.hasStartMarker) failures.push("Flow start marker should be removed.");
if (report.branchCount > 0) failures.push(`Flow branches should be removed, found ${report.branchCount}.`);

report.screens.forEach((screen, index) => {
  const expectedAlign = index === 0 ? "center" : index % 2 === 0 ? "left" : "right";
  if (screen.align !== expectedAlign) {
    failures.push(`Screen ${index + 1} should align ${expectedAlign}, found ${screen.align}.`);
  }
  if (!screen.title) failures.push(`Screen ${index + 1} is missing title text.`);
  if (screen.align === "center" && Math.abs(screen.centerX - report.viewportWidth / 2) > report.viewportWidth * 0.08) {
    failures.push(`Centered screen ${index + 1} is not centered enough: x=${screen.centerX}.`);
  }
  if (screen.align === "left" && screen.centerX > report.viewportWidth * 0.47) {
    failures.push(`Left-aligned screen ${index + 1} is too centered/right: x=${screen.centerX}.`);
  }
  if (screen.align === "right" && screen.centerX < report.viewportWidth * 0.53) {
    failures.push(`Right-aligned screen ${index + 1} is too centered/left: x=${screen.centerX}.`);
  }
});

if (failures.length > 0) {
  throw new Error(`Flow line removal failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Flow line removal passed: no line layer with ${report.screenCount} text screens.`);

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const staticFailures = [];
[
  "scroll-behavior: smooth",
  "scroll-snap-type: y proximity",
  "scroll-snap-align: start",
  "scroll-snap-stop: normal",
  "overscroll-behavior-y: contain",
].forEach((token) => {
  if (!css.includes(token)) staticFailures.push(`Missing native scroll smoothing token: ${token}`);
});

if (!css.includes("@media (prefers-reduced-motion: reduce)") || !css.includes("scroll-behavior: auto")) {
  staticFailures.push("Reduced motion should disable smooth scrolling.");
}

[
  'addEventListener("scroll"',
  "getBoundingClientRect()",
  "requestAnimationFrame(render)",
  "Lenis",
  "locomotive-scroll",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    staticFailures.push(`Scroll smoothness should stay native, found: ${token}`);
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
await page.waitForTimeout(800);

const report = await page.evaluate(async () => {
  const rootStyle = getComputedStyle(document.documentElement);
  const screens = [...document.querySelectorAll(".text-screen")];
  const footer = document.querySelector(".site-crowd-footer");
  const sectionSnapAligns = screens.map((screen) => getComputedStyle(screen).scrollSnapAlign);
  const footerSnapAlign = footer ? getComputedStyle(footer).scrollSnapAlign : "";
  const before = window.scrollY;
  window.scrollTo({ top: window.innerHeight * 1.1, behavior: "smooth" });
  await new Promise((resolve) => setTimeout(resolve, 700));
  const after = window.scrollY;
  const secondScreenTop = Math.round(screens[1]?.getBoundingClientRect().top ?? 9999);

  return {
    after,
    before,
    footerSnapAlign,
    rootOverscroll: rootStyle.overscrollBehaviorY,
    rootScrollBehavior: rootStyle.scrollBehavior,
    rootSnapType: rootStyle.scrollSnapType,
    secondScreenTop,
    sectionSnapAligns,
    viewportHeight: window.innerHeight,
  };
});

await browser.close();

const failures = [...staticFailures];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.rootScrollBehavior !== "smooth") failures.push(`Root should use smooth scroll behavior: ${report.rootScrollBehavior}.`);
if (!report.rootSnapType.includes("y")) {
  failures.push(`Root should use y-axis snapping: ${report.rootSnapType}.`);
}
if (report.rootOverscroll !== "contain") failures.push(`Root should contain overscroll bounce: ${report.rootOverscroll}.`);
if (report.sectionSnapAligns.some((value) => value !== "start")) {
  failures.push(`Text screens should snap from their start edges: ${report.sectionSnapAligns.join(", ")}.`);
}
if (report.footerSnapAlign !== "start") failures.push(`Footer should snap from start edge: ${report.footerSnapAlign}.`);
if (report.after <= report.before + 80) failures.push(`Smooth scroll should move the page: ${report.before} -> ${report.after}.`);
if (Math.abs(report.secondScreenTop) > report.viewportHeight * 0.55) {
  failures.push(`Smooth scroll should settle near the next full-screen section: top=${report.secondScreenTop}.`);
}

if (failures.length > 0) {
  throw new Error(`Scroll smoothness failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Scroll smoothness passed: ${report.rootSnapType}, y=${Math.round(report.after)}.`);

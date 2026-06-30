import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const pkg = readFileSync(resolve(root, "package.json"), "utf8");

const staticFailures = [];
[
  'import Lenis from "lenis"',
  "function SmoothScrollController",
  "new Lenis",
  "lenis.on(\"scroll\"",
  "--scroll-progress",
  "--scroll-velocity",
  "--scroll-drift-x",
  "--scroll-drift-y",
  "data-smooth-scroll",
  "scroll-snap-align: start",
  "scroll-snap-stop: normal",
  "overscroll-behavior-y: contain",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    staticFailures.push(`Missing DepthGallery-style smooth scroll token: ${token}`);
  }
});

if (!pkg.includes("\"lenis\"")) {
  staticFailures.push("Package should include lenis for smooth scroll interpolation.");
}

[
  "getBoundingClientRect()",
  "locomotive-scroll",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    staticFailures.push(`Scroll smoothing should avoid layout-heavy or unrelated tokens, found: ${token}`);
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
  await new Promise((resolve) => setTimeout(resolve, 900));
  const after = window.scrollY;
  const secondScreenTop = Math.round(screens[1]?.getBoundingClientRect().top ?? 9999);

  return {
    after,
    before,
    footerSnapAlign,
    rootDataset: document.documentElement.dataset.smoothScroll ?? "",
    rootOverscroll: rootStyle.overscrollBehaviorY,
    rootSnapType: rootStyle.scrollSnapType,
    scrollDriftX: rootStyle.getPropertyValue("--scroll-drift-x").trim(),
    scrollDriftY: rootStyle.getPropertyValue("--scroll-drift-y").trim(),
    scrollProgress: Number(rootStyle.getPropertyValue("--scroll-progress") || 0),
    scrollVelocity: Number(rootStyle.getPropertyValue("--scroll-velocity") || 0),
    secondScreenTop,
    sectionSnapAligns,
    viewportHeight: window.innerHeight,
  };
});

await browser.close();

const failures = [...staticFailures];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.rootDataset !== "active") failures.push(`Lenis smooth scroll controller should be active: ${report.rootDataset}.`);
if (report.rootSnapType !== "none") failures.push(`Root scroll snap should be disabled for smoother interpolation: ${report.rootSnapType}.`);
if (report.rootOverscroll !== "contain") failures.push(`Root should contain overscroll bounce: ${report.rootOverscroll}.`);
if (report.sectionSnapAligns.some((value) => value !== "start")) {
  failures.push(`Text screens should snap from their start edges: ${report.sectionSnapAligns.join(", ")}.`);
}
if (report.footerSnapAlign !== "start") failures.push(`Footer should snap from start edge: ${report.footerSnapAlign}.`);
if (report.after <= report.before + 80) failures.push(`Smooth scroll should move the page: ${report.before} -> ${report.after}.`);
if (report.scrollProgress <= 0) failures.push(`Scroll progress CSS variable should update: ${report.scrollProgress}.`);
if (!report.scrollDriftX.endsWith("px") || !report.scrollDriftY.endsWith("px")) {
  failures.push(`Scroll drift variables should be px values: ${report.scrollDriftX}, ${report.scrollDriftY}.`);
}
if (Math.abs(report.secondScreenTop) > report.viewportHeight * 0.78) {
  failures.push(`Smooth scroll should move toward the next full-screen section: top=${report.secondScreenTop}.`);
}

if (failures.length > 0) {
  throw new Error(`Scroll smoothness failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Scroll smoothness passed: ${report.rootSnapType}, y=${Math.round(report.after)}.`);

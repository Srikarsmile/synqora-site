import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const failures = [];
const forbiddenPatterns = [
  ["scroll-linked CSS animation timeline", /animation-timeline\s*:/],
  ["SVG stroke dash animation", /stroke-dash(?:array|offset)/],
  ["paint-time drop shadows", /drop-shadow\(/],
  ["backdrop blur on moving layers", /backdrop-filter\s*:/],
  ["content-visibility reveal hitch", /content-visibility:\s*auto/],
  ["custom depth scroll controller", /DepthScrollController/],
  ["depth scroll data state", /data-depth-scroll-state/],
  ["scrollIntoView monkey patch", /Element\.prototype\.scrollIntoView/],
  ["scroll snap section locks", /scroll-snap-align/],
  ["scroll-linked inline style writer", /\.style\.setProperty/],
];

for (const [name, pattern] of forbiddenPatterns) {
  if (pattern.test(app) || pattern.test(css)) failures.push(`Found ${name}.`);
}

if (!css.includes("contain: layout paint style")) {
  failures.push("Moving visual layers should use layout/paint containment.");
}
if (!app.includes("function DepthStageController") || !css.includes(".depth-scroll-sticky") || !css.includes("position: sticky")) {
  failures.push("Desktop depth should use one bounded sticky stage, not a global scroll controller.");
}

if (failures.length > 0) {
  throw new Error(`Scroll performance budget failed:\n${failures.join("\n")}`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 3,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);

const report = await page.evaluate(async () => {
  const frameGaps = [];
  const monitorFrames = new Promise((resolve) => {
    let last = performance.now();
    let frames = 0;

    const tick = (now) => {
      frameGaps.push(now - last);
      last = now;
      frames += 1;

      if (frames >= 150) {
        resolve();
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });

  const scrollScreens = (async () => {
    for (let index = 1; index <= 6; index += 1) {
      window.scrollTo({ top: index * window.innerHeight, behavior: "auto" });
      await new Promise((resolve) => setTimeout(resolve, 55));
    }
    document.querySelector(".site-crowd-footer")?.scrollIntoView({ block: "start", behavior: "auto" });
    await new Promise((resolve) => setTimeout(resolve, 55));
    document.querySelector("#contact")?.scrollIntoView({ block: "start", behavior: "auto" });
  })();

  await Promise.all([monitorFrames, scrollScreens]);

  const sortedGaps = [...frameGaps].sort((a, b) => a - b);
  const percentile = (ratio) => sortedGaps[Math.floor(sortedGaps.length * ratio)] || 0;
  const screens = [...document.querySelectorAll(".text-screen")];
  const storyScreens = [...document.querySelectorAll(".depth-scroll-stage .text-screen")];

  return {
    contactInlineStyle: document.querySelector("#contact")?.getAttribute("style") ?? "",
    frameCount: frameGaps.length,
    htmlDepthStage: document.documentElement.dataset.depthStage ?? "",
    htmlInlineStyle: document.documentElement.getAttribute("style") ?? "",
    longFrames: frameGaps.filter((gap) => gap > 50).length,
    p95FrameGap: percentile(0.95),
    rootDepthDataset: document.documentElement.dataset.depthScroll ?? "",
    screenInlineStyleCount: screens.filter((screen) => screen.getAttribute("style")).length,
    screenPositions: screens.map((screen) => getComputedStyle(screen).position),
    storyPositions: storyScreens.map((screen) => getComputedStyle(screen).position),
  };
});

await browser.close();

if (report.rootDepthDataset) failures.push(`Native scroll should not expose depth dataset: ${JSON.stringify(report)}.`);
if (report.htmlDepthStage !== "native") failures.push(`Mobile should disable the bounded depth stage: ${JSON.stringify(report)}.`);
if (report.htmlInlineStyle) failures.push(`Native scroll should not mutate root inline styles: ${JSON.stringify(report)}.`);
if (report.screenInlineStyleCount > 0 || report.contactInlineStyle) {
  failures.push(`Native scroll should not write per-section inline styles: ${JSON.stringify(report)}.`);
}
if (report.screenPositions.some((position) => position !== "relative")) {
  failures.push(`Screens should stay in normal flow: ${JSON.stringify(report)}.`);
}
if (report.storyPositions.some((position) => position !== "relative")) {
  failures.push(`Story screens should stay native on mobile: ${JSON.stringify(report)}.`);
}
if (report.longFrames > Math.max(8, report.frameCount * 0.12)) {
  failures.push(`Native scroll has too many slow frames: ${JSON.stringify(report)}.`);
}
if (report.p95FrameGap > 64) {
  failures.push(`Native scroll frame pacing is too slow: ${JSON.stringify(report)}.`);
}

if (failures.length > 0) {
  throw new Error(`Scroll performance budget failed:\n${failures.join("\n")}`);
}

console.log(`Scroll performance budget passed: p95 ${report.p95FrameGap.toFixed(1)}ms, no inline scroll writes.`);

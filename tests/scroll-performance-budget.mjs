import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const forbiddenPatterns = [
  ["scroll-linked CSS animation timeline", /animation-timeline\s*:/],
  ["SVG stroke dash animation", /stroke-dash(?:array|offset)/],
  ["paint-time drop shadows", /drop-shadow\(/],
  ["backdrop blur on moving layers", /backdrop-filter\s*:/],
  ["content-visibility reveal hitch", /content-visibility:\s*auto/],
  ["manual requestAnimationFrame render loop", /requestAnimationFrame\(render\)/],
  ["layout reads in scroll animation code", /getBoundingClientRect\(\)/],
];

const failures = forbiddenPatterns
  .filter(([, pattern]) => pattern.test(app) || pattern.test(css))
  .map(([name]) => `Found ${name}.`);

if (!css.includes("contain: layout paint style")) {
  failures.push("Moving visual layers should use layout/paint containment.");
}

[
  "scheduleDepthFrame",
  "stopDepthFrame",
  "data-depth-scroll-state",
].forEach((token) => {
  if (!app.includes(token)) failures.push(`Depth scroll should have an idle scheduler token: ${token}.`);
});

if (failures.length > 0) {
  throw new Error(`Scroll performance budget failed:\n${failures.join("\n")}`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 3,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

await page.addInitScript(() => {
  window.__scrollPerfProbe = {
    currentFrameWrites: 0,
    frameGaps: [],
    frameStyleWrites: [],
    totalStyleWrites: 0,
  };

  const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function instrumentedSetProperty(name, value, priority) {
    window.__scrollPerfProbe.currentFrameWrites += 1;
    window.__scrollPerfProbe.totalStyleWrites += 1;
    return nativeSetProperty.call(this, name, value, priority);
  };

  let lastFrameTime = performance.now();
  const readFrame = (now) => {
    window.__scrollPerfProbe.frameGaps.push(now - lastFrameTime);
    window.__scrollPerfProbe.frameStyleWrites.push(window.__scrollPerfProbe.currentFrameWrites);
    window.__scrollPerfProbe.currentFrameWrites = 0;
    lastFrameTime = now;
    requestAnimationFrame(readFrame);
  };

  requestAnimationFrame(readFrame);
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(async () => {
  for (let index = 0; index < 5; index += 1) {
    window.scrollTo({ top: (index + 1) * window.innerHeight, behavior: "smooth" });
    await new Promise((resolve) => setTimeout(resolve, 650));
  }
});
await page.waitForTimeout(500);

const report = await page.evaluate(() => {
  const gaps = window.__scrollPerfProbe.frameGaps.slice(10);
  const writes = window.__scrollPerfProbe.frameStyleWrites.slice(10);
  const percentile = (values, ratio) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * ratio)] || 0;
  };

  return {
    frames: gaps.length,
    longFrames: gaps.filter((gap) => gap > 34).length,
    maxFrameGap: Math.max(...gaps),
    maxStyleWritesPerFrame: Math.max(...writes),
    p95FrameGap: percentile(gaps, 0.95),
    p95StyleWritesPerFrame: percentile(writes, 0.95),
    totalStyleWrites: window.__scrollPerfProbe.totalStyleWrites,
  };
});

await page.waitForTimeout(900);

const idleReport = await page.evaluate(async () => {
  const beforeWrites = window.__scrollPerfProbe.totalStyleWrites;
  const beforeFrameCount = window.__scrollPerfProbe.frameGaps.length;

  await new Promise((resolve) => setTimeout(resolve, 650));

  const afterWrites = window.__scrollPerfProbe.totalStyleWrites;
  const afterFrameCount = window.__scrollPerfProbe.frameGaps.length;

  return {
    depthState: document.documentElement.dataset.depthScrollState ?? "",
    frames: afterFrameCount - beforeFrameCount,
    writes: afterWrites - beforeWrites,
  };
});

await browser.close();

if (report.p95StyleWritesPerFrame > 42) {
  failures.push(`Depth scroll writes too many style properties per frame: ${JSON.stringify(report)}.`);
}
if (report.p95FrameGap > 42) {
  failures.push(`Depth scroll has slow frame pacing on mobile: ${JSON.stringify(report)}.`);
}
if (report.longFrames > Math.max(4, report.frames * 0.08)) {
  failures.push(`Depth scroll has too many long mobile frames: ${JSON.stringify(report)}.`);
}
if (idleReport.depthState !== "idle") {
  failures.push(`Depth scroll should enter idle state after settling: ${JSON.stringify(idleReport)}.`);
}
if (idleReport.writes > 2) {
  failures.push(`Idle depth scroll should stop writing styles: ${JSON.stringify(idleReport)}.`);
}

if (failures.length > 0) {
  throw new Error(`Scroll performance budget failed:\n${failures.join("\n")}`);
}

console.log(
  `Scroll performance budget passed: p95 ${Math.round(report.p95StyleWritesPerFrame)} writes, ${report.p95FrameGap.toFixed(1)}ms frames.`,
);

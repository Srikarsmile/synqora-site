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
  "function DepthScrollController",
  "scrollTarget",
  "scrollCurrent",
  "velocityDamping",
  "data-depth-scroll",
  "--scroll-progress",
  "--scroll-velocity",
  "--depth-scroll-current",
  "--depth-active-index",
  "--scroll-drift-x",
  "--scroll-drift-y",
  "--screen-distance",
  "--screen-copy-opacity",
  "position: sticky",
  "transform-style: preserve-3d",
  "scroll-snap-align: start",
  "scroll-snap-stop: normal",
  "overscroll-behavior-y: contain",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    staticFailures.push(`Missing DepthGallery-style smooth scroll token: ${token}`);
  }
});

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
  const copyTransformBefore = getComputedStyle(screens[1]?.querySelector(".screen-copy")).transform;
  const before = window.scrollY;
  window.scrollTo({ top: window.innerHeight * 1.1, behavior: "smooth" });
  await new Promise((resolve) => setTimeout(resolve, 900));
  const after = window.scrollY;
  const secondScreenTop = Math.round(screens[1]?.getBoundingClientRect().top ?? 9999);
  const secondScreenStyle = screens[1] ? getComputedStyle(screens[1]) : null;
  const secondCopyStyle = screens[1]?.querySelector(".screen-copy")
    ? getComputedStyle(screens[1].querySelector(".screen-copy"))
    : null;
  const answersIndex = screens.findIndex((screen) => screen.id === "answers");
  const contactIndex = screens.findIndex((screen) => screen.id === "contact");

  window.scrollTo({ top: window.innerHeight * (contactIndex - 0.5), behavior: "auto" });
  await new Promise((resolve) => setTimeout(resolve, 320));

  const transitionPoint = document.elementFromPoint(
    Math.round(window.innerWidth / 2),
    Math.round(window.innerHeight * 0.72),
  );
  const transitionOwner = transitionPoint?.closest(".text-screen")?.id ?? "";
  const answersRect = screens[answersIndex]?.getBoundingClientRect();
  const contactRect = screens[contactIndex]?.getBoundingClientRect();

  return {
    after,
    before,
    copyTransformBefore,
    copyTransformAfter: secondCopyStyle?.transform ?? "",
    footerSnapAlign,
    rootDataset: document.documentElement.dataset.depthScroll ?? "",
    rootOverscroll: rootStyle.overscrollBehaviorY,
    rootSnapType: rootStyle.scrollSnapType,
    activeIndex: Number(rootStyle.getPropertyValue("--depth-active-index") || 0),
    depthCurrent: Number(rootStyle.getPropertyValue("--depth-scroll-current") || 0),
    depthTarget: Number(rootStyle.getPropertyValue("--depth-scroll-target") || 0),
    scrollDriftX: rootStyle.getPropertyValue("--scroll-drift-x").trim(),
    scrollDriftY: rootStyle.getPropertyValue("--scroll-drift-y").trim(),
    scrollProgress: Number(rootStyle.getPropertyValue("--scroll-progress") || 0),
    scrollVelocity: Number(rootStyle.getPropertyValue("--scroll-velocity") || 0),
    secondScreenTop,
    secondScreenDistance: secondScreenStyle?.getPropertyValue("--screen-distance").trim() ?? "",
    secondScreenOpacity: secondScreenStyle?.getPropertyValue("--screen-copy-opacity").trim() ?? "",
    secondScreenPosition: secondScreenStyle?.position ?? "",
    sectionSnapAligns,
    contactTransition: {
      answersTop: Math.round(answersRect?.top ?? 9999),
      contactTop: Math.round(contactRect?.top ?? 9999),
      owner: transitionOwner,
    },
    viewportHeight: window.innerHeight,
  };
});

await browser.close();

const failures = [...staticFailures];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.rootDataset !== "active") failures.push(`DepthGallery-style virtual scroll controller should be active: ${report.rootDataset}.`);
if (report.rootSnapType !== "none") failures.push(`Root scroll snap should be disabled for smoother interpolation: ${report.rootSnapType}.`);
if (report.rootOverscroll !== "contain") failures.push(`Root should contain overscroll bounce: ${report.rootOverscroll}.`);
if (report.secondScreenPosition !== "sticky") failures.push(`Text screens should be sticky depth panels: ${report.secondScreenPosition}.`);
if (report.sectionSnapAligns.some((value) => value !== "start")) {
  failures.push(`Text screens should snap from their start edges: ${report.sectionSnapAligns.join(", ")}.`);
}
if (report.footerSnapAlign !== "start") failures.push(`Footer should snap from start edge: ${report.footerSnapAlign}.`);
if (report.after <= report.before + 80) failures.push(`Smooth scroll should move the page: ${report.before} -> ${report.after}.`);
if (report.depthTarget <= 0 || report.depthCurrent <= 0) {
  failures.push(`Virtual depth scroll should update target/current: ${report.depthTarget}, ${report.depthCurrent}.`);
}
if (report.activeIndex < 1) failures.push(`Virtual depth active index should advance: ${report.activeIndex}.`);
if (report.scrollProgress <= 0) failures.push(`Scroll progress CSS variable should update: ${report.scrollProgress}.`);
if (!report.scrollDriftX.endsWith("px") || !report.scrollDriftY.endsWith("px")) {
  failures.push(`Scroll drift variables should be px values: ${report.scrollDriftX}, ${report.scrollDriftY}.`);
}
if (!report.secondScreenDistance || !report.secondScreenOpacity) {
  failures.push(`Each depth panel should receive per-screen CSS variables: ${report.secondScreenDistance}, ${report.secondScreenOpacity}.`);
}
if (!report.copyTransformAfter || report.copyTransformAfter === "none" || report.copyTransformAfter === report.copyTransformBefore) {
  failures.push(`Depth panel copy should transform as virtual depth changes: ${report.copyTransformBefore} -> ${report.copyTransformAfter}.`);
}
if (Math.abs(report.secondScreenTop) > report.viewportHeight * 0.78) {
  failures.push(`Smooth scroll should move toward the next full-screen section: top=${report.secondScreenTop}.`);
}
if (report.contactTransition.contactTop > 96 && report.contactTransition.owner === "contact") {
  failures.push(`Contact screen should not overlay the previous screen before it reaches the top: ${JSON.stringify(report.contactTransition)}.`);
}

if (failures.length > 0) {
  throw new Error(`Scroll smoothness failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Depth scroll smoothness passed: ${report.rootSnapType}, current=${report.depthCurrent.toFixed(2)}.`);

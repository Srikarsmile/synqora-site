import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const peepsSpritePath = resolve(root, "public/images/peeps/all-peeps.png");

const staticFailures = [];
const crowdSurface = app.slice(
  app.indexOf("function CrowdCanvas"),
  app.indexOf("export function App"),
);
[
  "function CrowdCanvas",
  "function CrowdFooter",
  "site-crowd-footer",
  "crowd-canvas",
  "Stay",
  "extraordinary.",
  "Don't be",
  "the same.",
  "info@synqora.tech",
  "mailto:info@synqora.tech",
  "email-link",
  "/images/peeps/all-peeps.png",
  "naturalWidth",
  "drawImage",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    staticFailures.push(`Missing crowd footer token: ${token}`);
  }
});

[
  'import { gsap }',
  "gsap.",
  "@gsap/react",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    staticFailures.push(`Crowd footer should stay local and scroll-passive, found: ${token}`);
  }
});

[
  'addEventListener("scroll"',
].forEach((token) => {
  if (crowdSurface.includes(token)) {
    staticFailures.push(`Crowd footer should not subscribe to page scroll, found: ${token}`);
  }
});

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { width: 1440, height: 760 },
});

const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const report = await page.evaluate(async () => {
  const footer = document.querySelector(".site-crowd-footer");
  const canvas = document.querySelector(".crowd-canvas");
  const title = document.querySelector(".crowd-footer-title");
  const email = document.querySelector(".crowd-footer-email");
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise((resolve) => setTimeout(resolve, 900));
  const titleRect = title?.getBoundingClientRect();
  const canvasRect = canvas?.getBoundingClientRect();
  const footerRect = footer?.getBoundingClientRect();
  const emailRect = email?.getBoundingClientRect();

  let paintedPixels = 0;
  if (canvas instanceof HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    const sampleWidth = Math.min(canvas.width, 180);
    const sampleHeight = Math.min(canvas.height, 120);
    if (context && sampleWidth > 0 && sampleHeight > 0) {
      const image = context.getImageData(0, canvas.height - sampleHeight, sampleWidth, sampleHeight).data;
      for (let index = 3; index < image.length; index += 16) {
        if (image[index] > 0) paintedPixels += 1;
      }
    }
  }

  return {
    footer: Boolean(footer),
    afterMain: Boolean(document.querySelector("main + footer.site-crowd-footer")),
    label: footer?.querySelector(".crowd-footer-label")?.textContent?.trim() ?? "",
    hasLabelElement: Boolean(footer?.querySelector(".crowd-footer-label")),
    title: footer?.querySelector(".crowd-footer-title")?.textContent?.trim() ?? "",
    titleLines: [...(footer?.querySelectorAll(".crowd-footer-title span") ?? [])].map((line) => line.textContent?.trim() ?? ""),
    email: footer?.querySelector(".crowd-footer-email")?.textContent?.trim() ?? "",
    emailHref: footer?.querySelector(".crowd-footer-email .email-link")?.getAttribute("href") ?? "",
    emailInitialDecoration: footer?.querySelector(".crowd-footer-email .email-link")
      ? getComputedStyle(footer.querySelector(".crowd-footer-email .email-link")).textDecorationLine
      : "",
    canvas: Boolean(canvas),
    canvasWidth: canvas instanceof HTMLCanvasElement ? canvas.width : 0,
    canvasHeight: canvas instanceof HTMLCanvasElement ? canvas.height : 0,
    paintedPixels,
    titleAbovePeople: Boolean(titleRect && canvasRect && titleRect.bottom + 24 < canvasRect.top),
    emailAbovePeople: Boolean(emailRect && canvasRect && emailRect.bottom + 18 < canvasRect.top),
    emailNearBottom: Boolean(emailRect && footerRect && emailRect.bottom > footerRect.bottom - 260),
    footerHeight: Math.round(footer?.getBoundingClientRect().height ?? 0),
  };
});

let footerEmailHoverDecoration = "";
if (report.emailHref) {
  await page.locator(".crowd-footer-email .email-link").hover();
  footerEmailHoverDecoration = await page.locator(".crowd-footer-email .email-link").evaluate((email) => getComputedStyle(email).textDecorationLine);
}

await browser.close();

const failures = [...staticFailures];
if (!existsSync(peepsSpritePath)) failures.push("Open Peeps sprite sheet is missing.");
if (existsSync(peepsSpritePath)) {
  const signature = readFileSync(peepsSpritePath).subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") failures.push("Open Peeps sprite sheet is not a PNG.");
}
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (!report.footer) failures.push("Crowd footer is missing.");
if (!report.afterMain) failures.push("Crowd footer should render directly after main.");
if (app.includes("Crowd Canvas") || report.label.includes("Crowd Canvas") || report.hasLabelElement) {
  failures.push(`Crowd footer label should be removed, found: ${report.label}`);
}
if (report.titleLines.join(" ") !== "Stay extraordinary. Don't be the same.") {
  failures.push(`Crowd footer title is wrong: ${report.titleLines.join(" ")}`);
}
if (report.email !== "info@synqora.tech") failures.push(`Crowd footer email is wrong: ${report.email}`);
if (!report.emailHref) failures.push("Crowd footer email should render as a clickable link.");
if (report.emailHref !== "mailto:info@synqora.tech") failures.push(`Crowd footer email should use mailto href: ${report.emailHref}`);
if (report.emailInitialDecoration !== "none") failures.push(`Crowd footer email should not be underlined before hover: ${report.emailInitialDecoration}`);
if (!footerEmailHoverDecoration.includes("underline")) failures.push(`Crowd footer email should underline on hover: ${footerEmailHoverDecoration}`);
if (!report.canvas) failures.push("Crowd footer canvas is missing.");
if (report.canvasWidth < 900 || report.canvasHeight < 140) {
  failures.push(`Crowd canvas is too small: ${report.canvasWidth}x${report.canvasHeight}.`);
}
if (!report.titleAbovePeople) failures.push("Crowd footer title should sit above the people canvas.");
if (report.titleLines.length !== 4) {
  failures.push(`Crowd footer title should be split into a fuller four-line composition: ${JSON.stringify(report.titleLines)}`);
}
if (!report.emailNearBottom) failures.push("Crowd footer email should sit near the bottom edge.");
if (!report.emailAbovePeople) failures.push("Crowd footer email should sit above the people canvas.");
if (report.footerHeight < 650) failures.push(`Crowd footer should feel like a full screen: ${report.footerHeight}px.`);
if (report.paintedPixels < 20) failures.push(`Crowd canvas did not paint enough moving figures: ${report.paintedPixels}.`);

if (failures.length > 0) {
  throw new Error(`Crowd footer failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Crowd footer passed: ${report.canvasWidth}x${report.canvasHeight} canvas with ${report.paintedPixels} painted samples.`);

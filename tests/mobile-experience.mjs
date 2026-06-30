import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const staticFailures = [];
[
  "@media (max-width: 760px)",
  "--screen-height",
  "100dvh",
  "100lvh",
  "screen-gradient-contact",
  "scroll-snap-type: none",
  "crowd-footer-title",
  "crowd-canvas-wrap",
].forEach((token) => {
  if (!css.includes(token)) staticFailures.push(`Missing mobile layout token: ${token}`);
});

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 3,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const screenCoverage = [];
for (const id of ["hero", "services", "method", "examples", "answers", "contact"]) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(420);
  screenCoverage.push(await page.evaluate((screenId) => {
    const screen = document.getElementById(screenId);
    const rect = screen?.getBoundingClientRect();
    const sampleId = (y) => document.elementFromPoint(Math.round(window.innerWidth / 2), y)?.closest(".text-screen")?.id ?? "";

    return {
      id: screenId,
      backgroundImage: screen ? getComputedStyle(screen).backgroundImage : "",
      bottomOwner: sampleId(window.innerHeight - 2),
      height: Math.round(rect?.height ?? 0),
      middleOwner: sampleId(Math.round(window.innerHeight / 2)),
      topOwner: sampleId(2),
      viewportHeight: window.innerHeight,
    };
  }, id));
}

await page.locator("#contact").scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
const contactReport = await page.evaluate(() => {
  const rectOf = (selector) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
    return rect
      ? {
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
      }
      : null;
  };

  return {
    form: rectOf("#contact .contact-form"),
    screen: rectOf("#contact"),
    submit: rectOf("#contact .contact-submit"),
    title: rectOf("#contact .screen-title"),
    screenHeightCss: getComputedStyle(document.querySelector("#contact")).height,
    viewportHeight: window.innerHeight,
  };
});

await page.locator(".site-crowd-footer").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
const footerReport = await page.evaluate(() => {
  const rectOf = (selector) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
    return rect
      ? {
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
      }
      : null;
  };

  return {
    crowd: rectOf(".crowd-canvas-wrap"),
    email: rectOf(".crowd-footer-email"),
    footer: rectOf(".site-crowd-footer"),
    title: rectOf(".crowd-footer-title"),
    titleLines: [...document.querySelectorAll(".crowd-footer-title span")].map((line) => line.textContent?.trim() ?? ""),
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    footerBackground: getComputedStyle(document.querySelector(".site-crowd-footer")).backgroundColor,
    footerBackgroundImage: getComputedStyle(document.querySelector(".site-crowd-footer")).backgroundImage,
    footerHeightCss: getComputedStyle(document.querySelector(".site-crowd-footer")).height,
    htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
    htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    htmlScrollSnapType: getComputedStyle(document.documentElement).scrollSnapType,
    viewportHeight: window.innerHeight,
  };
});

await browser.close();

const failures = [...staticFailures];
const isWhiteBackground = (color) => {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return false;
  const [, red, green, blue] = match.map(Number);
  return red >= 248 && green >= 248 && blue >= 248;
};

if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);

screenCoverage.forEach((screen) => {
  if (Math.abs(screen.height - screen.viewportHeight) > 2) {
    failures.push(`Mobile ${screen.id} should cover exactly one visible screen: ${JSON.stringify(screen)}.`);
  }
  if (!screen.backgroundImage.includes("gradient")) {
    failures.push(`Mobile ${screen.id} should own a full-screen gradient: ${JSON.stringify(screen)}.`);
  }
  if ([screen.topOwner, screen.middleOwner, screen.bottomOwner].some((owner) => owner !== screen.id)) {
    failures.push(`Mobile ${screen.id} should cover the full viewport without another section leaking through: ${JSON.stringify(screen)}.`);
  }
});

if (!contactReport.screen || contactReport.screen.height > contactReport.viewportHeight + 72) {
  failures.push(`Mobile contact should fit close to one phone viewport: ${JSON.stringify(contactReport.screen)}.`);
}
if (!contactReport.screen || Math.abs(contactReport.screen.height - contactReport.viewportHeight) > 2) {
  failures.push(`Mobile contact section should exactly cover the current viewport: ${JSON.stringify(contactReport)}.`);
}
if (!contactReport.submit || contactReport.submit.bottom > contactReport.viewportHeight - 24) {
  failures.push(`Mobile contact submit should be visible above browser chrome: ${JSON.stringify(contactReport.submit)}.`);
}
if (!contactReport.form || contactReport.form.width < 330) {
  failures.push(`Mobile contact form should keep a comfortable readable width: ${JSON.stringify(contactReport.form)}.`);
}
if (!contactReport.title || contactReport.title.height > 126) {
  failures.push(`Mobile contact title should not dominate the form screen: ${JSON.stringify(contactReport.title)}.`);
}

if (!footerReport.footer || footerReport.footer.height < footerReport.viewportHeight * 0.9) {
  failures.push(`Mobile footer should remain a deliberate final screen: ${JSON.stringify(footerReport.footer)}.`);
}
if (!footerReport.footer || Math.abs(footerReport.footer.height - footerReport.viewportHeight) > 2) {
  failures.push(`Mobile footer should exactly cover the current viewport: ${JSON.stringify(footerReport)}.`);
}
if (!isWhiteBackground(footerReport.htmlBackground) || !isWhiteBackground(footerReport.bodyBackground)) {
  failures.push(`Mobile footer overscroll should reveal white page chrome, not the peach page background: ${JSON.stringify(footerReport)}.`);
}
if (!isWhiteBackground(footerReport.footerBackground) || footerReport.footerBackgroundImage !== "none") {
  failures.push(`Mobile footer itself should stay clean white behind the people band: ${JSON.stringify(footerReport)}.`);
}
if (footerReport.htmlScrollSnapType !== "none" || footerReport.htmlScrollBehavior !== "auto") {
  failures.push(`Mobile touch scrolling should not fight section snapping: ${JSON.stringify(footerReport)}.`);
}
if (!footerReport.title || !footerReport.email) {
  failures.push(`Mobile footer title/email are missing: ${JSON.stringify(footerReport)}.`);
}
if (footerReport.titleLines.join(" ") !== "Stay extraordinary. Don't be the same.") {
  failures.push(`Mobile footer headline copy is wrong: ${JSON.stringify(footerReport.titleLines)}.`);
}
if (footerReport.titleLines.length !== 4) {
  failures.push(`Mobile footer headline should be a fuller four-line lockup: ${JSON.stringify(footerReport.titleLines)}.`);
}
if (footerReport.title && (footerReport.title.height < 178 || footerReport.title.height > 310)) {
  failures.push(`Mobile footer headline should fill more of the screen without colliding: ${JSON.stringify(footerReport.title)}.`);
}
if (footerReport.title && footerReport.email && footerReport.email.top - footerReport.title.bottom > 180) {
  failures.push(`Mobile footer has too much empty space between headline and email: ${JSON.stringify(footerReport)}.`);
}
if (!footerReport.crowd || footerReport.crowd.height > 205) {
  failures.push(`Mobile people band should not consume the lower third: ${JSON.stringify(footerReport.crowd)}.`);
}
if (footerReport.email && footerReport.crowd && footerReport.email.bottom > footerReport.crowd.top - 80) {
  failures.push(`Mobile email should sit clearly above the people band: ${JSON.stringify(footerReport)}.`);
}
if (footerReport.pet && footerReport.crowd && footerReport.pet.bottom > footerReport.crowd.top - 48) {
  failures.push(`Mobile pet should stay above the people, not on the crowd edge: ${JSON.stringify(footerReport)}.`);
}
if (footerReport.pet && Math.abs((footerReport.pet.left + footerReport.pet.right) / 2 - 195) > 96) {
  failures.push(`Mobile pet should join the centered footer composition instead of sitting on an edge: ${JSON.stringify(footerReport.pet)}.`);
}
if (footerReport.pet && footerReport.crowd && footerReport.pet.bottom > footerReport.crowd.top - 118) {
  failures.push(`Mobile pet needs clear breathing room above the people band: ${JSON.stringify(footerReport)}.`);
}

if (failures.length > 0) {
  throw new Error(`Mobile experience failed:\n${failures.join("\n")}\n\n${JSON.stringify({ contactReport, footerReport }, null, 2)}`);
}

console.log(
  `Mobile experience passed: contact ${contactReport.screen.height}px, footer crowd ${footerReport.crowd.height}px.`,
);

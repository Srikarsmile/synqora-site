import { chromium } from "playwright";

const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";

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
await page.waitForTimeout(900);

const heroReport = await page.evaluate(() => {
  const wordmark = document.querySelector(".wordmark");
  const cta = document.querySelector("#hero .screen-cta");
  const title = document.querySelector("#hero .screen-title");
  const wordmarkStyle = wordmark ? getComputedStyle(wordmark) : null;
  const ctaStyle = cta ? getComputedStyle(cta) : null;
  const rectOf = (element) => {
    const rect = element?.getBoundingClientRect();
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
    cta: rectOf(cta),
    ctaFontSize: Number.parseFloat(ctaStyle?.fontSize ?? "0"),
    ctaText: cta?.textContent?.trim() ?? "",
    title: rectOf(title),
    wordmark: rectOf(wordmark),
    wordmarkFontSize: Number.parseFloat(wordmarkStyle?.fontSize ?? "0"),
    wordmarkWeight: wordmarkStyle?.fontWeight ?? "",
  };
});

const sectionReports = [];
for (const id of ["services", "method", "work-exkitchens", "work-holditdown", "answers"]) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(620);
  sectionReports.push(await page.evaluate((screenId) => {
    const screen = document.getElementById(screenId);
    const copy = screen?.querySelector(".screen-copy");
    const title = screen?.querySelector(".screen-title");
    const body = screen?.querySelector(".screen-copy-line");
    const note = screen?.querySelector(".screen-note");
    const rectOf = (element) => {
      const rect = element?.getBoundingClientRect();
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
      body: rectOf(body),
      bodyFontSize: Number.parseFloat(body ? getComputedStyle(body).fontSize : "0"),
      copy: rectOf(copy),
      copyOpacity: Number.parseFloat(copy ? getComputedStyle(copy).opacity : "0"),
      id: screenId,
      kind: screen?.getAttribute("data-screen-kind") ?? "",
      note: rectOf(note),
      title: rectOf(title),
      titleFontSize: Number.parseFloat(title ? getComputedStyle(title).fontSize : "0"),
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  }, id));
}

await page.locator("#contact").scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
const contactReport = await page.evaluate(() => {
  const screen = document.querySelector("#contact");
  const form = document.querySelector("#contact .contact-form");
  const copy = document.querySelector("#contact .screen-copy");
  const title = document.querySelector("#contact .screen-title");
  const rectOf = (element) => {
    const rect = element?.getBoundingClientRect();
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
    copy: rectOf(copy),
    form: rectOf(form),
    title: rectOf(title),
    titleFontSize: Number.parseFloat(title ? getComputedStyle(title).fontSize : "0"),
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  };
});

await page.locator(".site-crowd-footer").scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
const footerReport = await page.evaluate(() => {
  const footer = document.querySelector(".site-crowd-footer");
  const title = document.querySelector(".crowd-footer-title");
  const email = document.querySelector(".crowd-footer-email");
  const crowd = document.querySelector(".crowd-canvas-wrap");
  const rectOf = (element) => {
    const rect = element?.getBoundingClientRect();
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
    crowd: rectOf(crowd),
    email: rectOf(email),
    footer: rectOf(footer),
    title: rectOf(title),
    titleLines: [...document.querySelectorAll(".crowd-footer-title span")].map((line) => line.textContent?.trim() ?? ""),
    titleWeight: title ? getComputedStyle(title).fontWeight : "",
    viewportHeight: window.innerHeight,
  };
});

await browser.close();

const failures = [];

if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);

if (!heroReport.wordmark || heroReport.wordmarkFontSize < 21) {
  failures.push(`Wordmark should be large enough to read as the brand on desktop: ${JSON.stringify(heroReport.wordmark)} at ${heroReport.wordmarkFontSize}px.`);
}
if (heroReport.wordmarkWeight !== "300" && heroReport.wordmarkWeight !== "400") {
  failures.push(`Wordmark should stay quiet and premium, not bold: ${heroReport.wordmarkWeight}.`);
}
if (!heroReport.cta || heroReport.cta.height < 54 || heroReport.cta.width < 150 || heroReport.ctaFontSize < 16) {
  failures.push(`Hero CTA should be larger and easier to act on: ${JSON.stringify(heroReport)}.`);
}

sectionReports.forEach((section) => {
  if (!section.copy || section.copyOpacity < 0.96) {
    failures.push(`Desktop ${section.id} copy should be fully readable at rest: ${JSON.stringify(section)}.`);
  }
  if (!section.copy || section.copy.top < 128 || section.copy.bottom > section.viewportHeight - 92) {
    failures.push(`Desktop ${section.id} copy should sit comfortably inside the viewport: ${JSON.stringify(section.copy)}.`);
  }
  const minTitleWidth = section.kind === "work" ? 280 : 620;
  if (!section.title || section.title.width < minTitleWidth || section.title.height > section.viewportHeight * 0.48) {
    failures.push(`Desktop ${section.id} heading should have a readable measure instead of a narrow tower: ${JSON.stringify(section.title)}.`);
  }
  const minBodyWidth = section.kind === "work" ? 340 : 430;
  const minBodyFontSize = section.kind === "work" ? 19 : 22;
  if (!section.body || section.body.width < minBodyWidth || section.bodyFontSize < minBodyFontSize) {
    failures.push(`Desktop ${section.id} supporting copy should remain readable under the headline: ${JSON.stringify(section)}.`);
  }
});

if (!contactReport.form || contactReport.form.width < 500) {
  failures.push(`Contact form should use more of the empty left side: ${JSON.stringify(contactReport.form)}.`);
}
if (contactReport.form && contactReport.form.left < 64) {
  failures.push(`Contact form should not cling to the left browser edge: ${JSON.stringify(contactReport.form)}.`);
}
if (contactReport.form && contactReport.copy && contactReport.copy.left - contactReport.form.right < 176) {
  failures.push(`Contact form and copy need clear separation: ${JSON.stringify(contactReport)}.`);
}
if (!contactReport.title || contactReport.title.height > 250 || contactReport.titleFontSize > 82) {
  failures.push(`Contact heading should be slightly calmer than sales headings: ${JSON.stringify(contactReport)}.`);
}
if (footerReport.titleLines.join(" ") !== "Stay extraordinary. Don't be the same.") {
  failures.push(`Footer title copy is wrong: ${JSON.stringify(footerReport.titleLines)}.`);
}
if (footerReport.titleLines.length !== 4 || footerReport.titleWeight !== "300") {
  failures.push(`Footer should use a four-line Helvetica Neue Light lockup: ${JSON.stringify(footerReport)}.`);
}
if (!footerReport.title || footerReport.title.height < 300 || footerReport.title.height > 380 || footerReport.title.width < 560) {
  failures.push(`Desktop footer headline should feel full without squeezing the email: ${JSON.stringify(footerReport.title)}.`);
}
if (footerReport.title && footerReport.email && footerReport.email.top - footerReport.title.bottom < 18) {
  failures.push(`Footer email needs a clear gap below the headline: ${JSON.stringify(footerReport)}.`);
}
if (footerReport.email && footerReport.crowd && footerReport.email.bottom > footerReport.crowd.top - 18) {
  failures.push(`Footer email should remain readable above the people band: ${JSON.stringify(footerReport)}.`);
}

if (failures.length > 0) {
  throw new Error(`Approved design fixes failed:\n${failures.join("\n")}\n\n${JSON.stringify({ heroReport, sectionReports, contactReport, footerReport }, null, 2)}`);
}

console.log("Approved design fixes passed.");

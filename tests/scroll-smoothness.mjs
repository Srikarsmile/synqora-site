import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const failures = [];

[
  "function DepthScrollController",
  "data-depth-scroll",
  "Element.prototype.scrollIntoView",
  "scrollTarget",
  "scrollCurrent",
  "velocityDamping",
  "--screen-copy-opacity",
  "--screen-distance",
  "--depth-scroll-current",
  "scroll-snap-align",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    failures.push(`Native section scroll should not keep brittle depth-scroll token: ${token}`);
  }
});

[
  "height: var(--screen-height)",
  "#contact.text-screen",
  ".contact-form",
  ".site-crowd-footer",
  "scroll-snap-type: none",
  "function DepthStageController",
  "data-depth-stage",
  ".depth-scroll-stage",
  ".depth-scroll-sticky",
  ".depth-motion-field",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    failures.push(`Missing bounded depth-stage token: ${token}`);
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
await page.waitForTimeout(700);

const layoutReport = await page.evaluate(() => {
  const stage = document.querySelector(".depth-scroll-stage");
  const sticky = document.querySelector(".depth-scroll-sticky");
  const storyScreens = [...document.querySelectorAll(".depth-scroll-stage .text-screen")];
  const contact = document.querySelector("#contact");
  const footer = document.querySelector(".site-crowd-footer");
  const fields = [...document.querySelectorAll(".text-screen:not(#contact) .depth-motion-field")];
  const rectOf = (element) => {
    const rect = element?.getBoundingClientRect();
    return rect
      ? {
        height: Math.round(rect.height),
        top: Math.round(rect.top),
      }
      : null;
  };

  return {
    contactInlineStyle: contact?.getAttribute("style") ?? "",
    contactPosition: contact ? getComputedStyle(contact).position : "",
    depthStage: document.documentElement.dataset.depthStage ?? "",
    depthFieldInlineStyles: fields.filter((field) => field.getAttribute("style")).length,
    depthMaxOpacity: Math.max(...fields.map((field) => Number.parseFloat(getComputedStyle(field).opacity) || 0)),
    depthOrbitOpacity: Number.parseFloat(getComputedStyle(document.querySelector(".depth-motion-orbit")).opacity) || 0,
    depthThreadOpacity: Number.parseFloat(getComputedStyle(document.querySelector(".depth-thread-field")).opacity) || 0,
    expectedStageHeight: window.innerHeight * storyScreens.length,
    footerPosition: footer ? getComputedStyle(footer).position : "",
    rootDataset: document.documentElement.dataset.depthScroll ?? "",
    rootSnapType: getComputedStyle(document.documentElement).scrollSnapType,
    stage: rectOf(stage),
    sticky: rectOf(sticky),
    stickyPosition: sticky ? getComputedStyle(sticky).position : "",
    storyInlineStyleCount: storyScreens.filter((screen) => screen.getAttribute("style")).length,
    storyPositions: storyScreens.map((screen) => getComputedStyle(screen).position),
    storyScreenCount: storyScreens.length,
    storyScreenHeights: storyScreens.map((screen) => Math.round(screen.offsetHeight)),
    viewportHeight: window.innerHeight,
  };
});

const stageOwnerReport = [];
for (let index = 0; index < 6; index += 1) {
  await page.evaluate((stageIndex) => {
    const stage = document.querySelector(".depth-scroll-stage");
    window.scrollTo({ top: (stage?.offsetTop ?? 0) + stageIndex * window.innerHeight, behavior: "auto" });
  }, index);
  await page.waitForTimeout(520);
  stageOwnerReport.push(await page.evaluate(() => (
    document.elementFromPoint(
      Math.round(window.innerWidth / 2),
      Math.round(window.innerHeight / 2),
    )?.closest(".text-screen")?.id ?? ""
  )));
}

await page.evaluate(() => {
  const stage = document.querySelector(".depth-scroll-stage");
  window.scrollTo({ top: (stage?.offsetTop ?? 0) + window.innerHeight * 0.5, behavior: "auto" });
});
await page.waitForTimeout(720);
const transitionReport = await page.evaluate(() => {
  const rectOf = (element) => {
    const rect = element?.getBoundingClientRect();
    return rect
      ? {
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
      }
      : null;
  };

  return [...document.querySelectorAll(".depth-scroll-stage .text-screen")].map((screen) => {
    const style = getComputedStyle(screen);
    const copy = screen.querySelector(".screen-copy");
    const title = screen.querySelector(".screen-title");

    return {
      copyOpacity: copy ? Number.parseFloat(getComputedStyle(copy).opacity) || 0 : 0,
      id: screen.id,
      opacity: Number.parseFloat(style.opacity) || 0,
      rect: rectOf(screen),
      titleRect: rectOf(title),
      transform: style.transform,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  });
});

await page.locator(".site-crowd-footer").scrollIntoViewIfNeeded();
await page.waitForTimeout(350);
await page.evaluate(() => {
  document.getElementById("contact")?.scrollIntoView({ block: "start", behavior: "smooth" });
});
await page.waitForTimeout(1000);

const contactReport = await page.evaluate(() => {
  const contact = document.querySelector("#contact");
  const form = document.querySelector("#contact .contact-form");
  const copy = document.querySelector("#contact .screen-copy");
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
    contact: rectOf(contact),
    copy: rectOf(copy),
    copyOpacity: copy ? Number(getComputedStyle(copy).opacity) : 0,
    form: rectOf(form),
    formOpacity: form ? Number(getComputedStyle(form).opacity) : 0,
    ownerAtCenter: document.elementFromPoint(
      Math.round(window.innerWidth / 2),
      Math.round(window.innerHeight / 2),
    )?.closest(".text-screen, .site-crowd-footer")?.id ?? "",
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  };
});

await browser.close();

if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (layoutReport.rootDataset) failures.push(`Root should not expose depth-scroll state: ${layoutReport.rootDataset}.`);
if (layoutReport.depthStage !== "active") failures.push(`Desktop bounded depth stage should be active: ${layoutReport.depthStage}.`);
if (layoutReport.rootSnapType !== "none") failures.push(`Root scroll snap should stay disabled: ${layoutReport.rootSnapType}.`);
if (!layoutReport.stage || Math.abs(layoutReport.stage.height - layoutReport.expectedStageHeight) > 2) {
  failures.push(`Depth stage should provide one native scroll screen per story panel: ${JSON.stringify(layoutReport)}.`);
}
if (!layoutReport.sticky || Math.abs(layoutReport.sticky.height - layoutReport.viewportHeight) > 2 || layoutReport.stickyPosition !== "sticky") {
  failures.push(`Depth stage should use one bounded sticky viewport: ${JSON.stringify(layoutReport)}.`);
}
if (layoutReport.storyPositions.some((position) => position !== "absolute")) {
  failures.push(`Story panels should be stage-managed absolute panels on desktop: ${JSON.stringify(layoutReport.storyPositions)}.`);
}
if (layoutReport.contactPosition !== "relative" || layoutReport.footerPosition !== "relative" || layoutReport.contactInlineStyle) {
  failures.push(`Contact and footer must stay native, not stage-managed: ${JSON.stringify(layoutReport)}.`);
}
if (layoutReport.storyInlineStyleCount < layoutReport.storyScreenCount) {
  failures.push(`Depth stage should write layout transforms only to story panels: ${JSON.stringify(layoutReport)}.`);
}
if (layoutReport.depthFieldInlineStyles < 1) {
  failures.push(`Depth stage should still animate decorative fields: ${JSON.stringify(layoutReport)}.`);
}
if (layoutReport.depthMaxOpacity < 0.82 || layoutReport.depthOrbitOpacity < 0.72 || layoutReport.depthThreadOpacity < 0.82) {
  failures.push(`Decorative depth should be visible enough to read as depth, not a flat gradient: ${JSON.stringify(layoutReport)}.`);
}
if (layoutReport.storyScreenHeights.some((height) => Math.abs(height - layoutReport.viewportHeight) > 2)) {
  failures.push(`Every story panel should cover one viewport: ${JSON.stringify(layoutReport)}.`);
}
if (stageOwnerReport.join("|") !== "hero|services|method|work-exkitchens|work-holditdown|answers") {
  failures.push(`Depth stage should activate the expected panel as the user scrolls: ${JSON.stringify(stageOwnerReport)}.`);
}
const visibleTransitionPanels = transitionReport.filter((screen) => screen.opacity > 0.08);
if (visibleTransitionPanels.some((screen) => (
  !screen.rect
  || screen.rect.width < screen.viewportWidth - 2
  || screen.rect.height < screen.viewportHeight - 2
  || Math.abs(screen.rect.left) > 2
))) {
  failures.push(`Depth panels should stay full-bleed during transitions, not scale into cards: ${JSON.stringify(visibleTransitionPanels)}.`);
}
if (transitionReport.filter((screen) => screen.copyOpacity > 0.28).length > 1) {
  failures.push(`Depth transition text should not overlap as two readable screens: ${JSON.stringify(transitionReport)}.`);
}
if (!contactReport.contact || Math.abs(contactReport.contact.top) > 4) {
  failures.push(`Contact should scroll back to the top cleanly: ${JSON.stringify(contactReport)}.`);
}
if (!contactReport.form || contactReport.form.width < 300 || contactReport.form.bottom <= 0 || contactReport.form.top >= contactReport.viewportHeight) {
  failures.push(`Contact form should remain visible after scrolling back from footer: ${JSON.stringify(contactReport)}.`);
}
if (!contactReport.copy || contactReport.copy.width < 320 || contactReport.copy.bottom <= 0 || contactReport.copy.top >= contactReport.viewportHeight) {
  failures.push(`Contact copy should remain visible after scrolling back from footer: ${JSON.stringify(contactReport)}.`);
}
if (contactReport.formOpacity < 0.98 || contactReport.copyOpacity < 0.98) {
  failures.push(`Contact content should not fade or park: ${JSON.stringify(contactReport)}.`);
}
if (contactReport.ownerAtCenter !== "contact") {
  failures.push(`Viewport center should belong to contact after footer-to-contact scroll: ${JSON.stringify(contactReport)}.`);
}

if (failures.length > 0) {
  throw new Error(`Scroll smoothness failed:\n${failures.join("\n")}\n\n${JSON.stringify({ layoutReport, contactReport }, null, 2)}`);
}

console.log("Native full-screen scroll passed; contact stays visible after footer return.");

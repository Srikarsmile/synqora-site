import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const petAsset = resolve(root, "public/assets/pet/synqora-pet-sprite.svg");

const staticFailures = [];
[
  "function SitePet",
  "site-pet",
  "site-pet-sprite",
  "site-pet-frame-idle-one",
  "site-pet-frame-idle-two",
  "site-pet-frame-idle-three",
  "site-pet-frame-walk-right",
  "site-pet-frame-walk-down",
  "site-pet-frame-walk-left",
  "site-pet-frame-walk-up",
  "site-pet-frame-petted",
  "site-pet-frame-sleep",
  "data-pet-direction",
  "data-pet-avoid",
  "data-pet-footer",
  "data-pet-clarity=\"high\"",
  "activePetAlign",
  "activeFooterLift",
  "edgeTargets",
  "safeMinX",
  "/assets/pet/synqora-pet-sprite.svg",
  "Pet Synqora site companion",
  "<button",
  "type=\"button\"",
  "data-site-pet-source=\"derDere/site-pet\"",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    staticFailures.push(`Missing site pet token: ${token}`);
  }
});

[
  "createSitePet",
  "derdere.github.io/site-pet/site-pet.js",
  "setInterval(update, 150)",
  "site-pet-tentacle",
  "site-pet-tentacles",
  "synqora-octopus-pet.png",
  "<img",
  "Math.random() * (bounds.maxX - bounds.minX)",
  "window.innerHeight * 0.62",
].forEach((token) => {
  if (app.includes(token) || css.includes(token)) {
    staticFailures.push(`Site pet should use local sprite-sheet implementation, found: ${token}`);
  }
});

if (!existsSync(petAsset)) {
  staticFailures.push("Synqora sprite pet asset is missing.");
} else {
  const svg = readFileSync(petAsset, "utf8");
  if (!svg.includes('viewBox="0 0 512 576"')) {
    staticFailures.push("Pet sprite sheet should be 8 columns by 9 rows at 64px frames.");
  }
  if (!svg.includes('id="synqora-pet-body"')) {
    staticFailures.push("Pet sprite should use a named high-clarity body gradient.");
  }
  if (!svg.includes("url(#synqora-pet-body)")) {
    staticFailures.push("Pet sprite should not render as a flat black blob.");
  }
  if (!svg.includes('id="synqora-black-pet-core"')) {
    staticFailures.push("Pet sprite should keep the black site-pet character.");
  }
  if (!svg.includes('class="cheek"')) {
    staticFailures.push("Pet sprite should keep the expressive black pet face.");
  }
  if (!svg.includes('class="sleep-mark"')) {
    staticFailures.push("Pet sprite should include a clear sleep row for the black pet.");
  }
  [
    "#23d5e8",
    "#4169ff",
    "#8a5cff",
    "#ff6ea9",
    "#ff5005",
    "#b6fbff",
  ].forEach((color) => {
    if (svg.toLowerCase().includes(color)) {
      staticFailures.push(`Pet sprite palette should not use saturated toy color ${color}.`);
    }
  });
  [
    "#1e252b",
    "#303845",
    "#5e6973",
    "#2fa6a1",
    "#d75982",
  ].forEach((color) => {
    if (!svg.toLowerCase().includes(color)) {
      staticFailures.push(`Pet sprite should use premium muted palette color ${color}.`);
    }
  });
  [
    "frame-idle-one-7",
    "frame-idle-two-7",
    "frame-idle-three-7",
    "frame-walk-right-7",
    "frame-walk-down-7",
    "frame-walk-left-7",
    "frame-walk-up-7",
    "frame-petted-7",
    "frame-sleep-7",
  ].forEach((token) => {
    if (!svg.includes(`id="${token}"`)) staticFailures.push(`Pet sprite sheet is missing ${token}.`);
  });
}

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

const report = await page.evaluate(async () => {
  const pet = document.querySelector(".site-pet");
  const sprite = document.querySelector(".site-pet-sprite");
  const initialTransform = pet ? getComputedStyle(pet).transform : "";
  pet?.setAttribute("data-pet-state", "idle");
  pet?.removeAttribute("data-pet-idle");
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const initialSpriteAnimation = sprite ? getComputedStyle(sprite).animationName : "";
  const petStyle = pet ? getComputedStyle(pet) : null;
  const readWalkAnimation = async (direction) => {
    pet?.setAttribute("data-pet-state", "roaming");
    pet?.setAttribute("data-pet-direction", direction);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return sprite ? getComputedStyle(sprite).animationName : "";
  };
  const leftWalkAnimation = await readWalkAnimation("left");
  const upWalkAnimation = await readWalkAnimation("up");
  pet?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 80));
  const clickState = pet?.getAttribute("data-pet-state") ?? "";
  const pettedSpriteAnimation = sprite ? getComputedStyle(sprite).animationName : "";
  pet?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 80));
  const keyState = pet?.getAttribute("data-pet-state") ?? "";
  await new Promise((resolve) => setTimeout(resolve, 3600));
  const rect = pet?.getBoundingClientRect();
  const readAvoidance = async (selector) => {
    const screen = document.querySelector(selector);
    screen?.scrollIntoView({ block: "start", behavior: "instant" });
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const copyRect = screen?.querySelector(".screen-copy")?.getBoundingClientRect();
    const petRect = pet?.getBoundingClientRect();

    return {
      align: screen?.getAttribute("data-align") ?? "",
      avoid: pet?.getAttribute("data-pet-avoid") ?? "",
      copyLeft: Math.round(copyRect?.left ?? 0),
      copyRight: Math.round(copyRect?.right ?? 0),
      petLeft: Math.round(petRect?.left ?? 0),
      petRight: Math.round(petRect?.right ?? 0),
    };
  };
  const avoidance = {
    contact: await readAvoidance("#contact"),
    method: await readAvoidance("#method"),
    services: await readAvoidance("#services"),
  };
  const readFooterClearance = async () => {
    const footer = document.querySelector(".site-crowd-footer");
    const crowd = footer?.querySelector(".crowd-canvas-wrap");
    footer?.scrollIntoView({ block: "start", behavior: "instant" });
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const petRect = pet?.getBoundingClientRect();
    const crowdRect = crowd?.getBoundingClientRect();

    return {
      footerState: pet?.getAttribute("data-pet-footer") ?? "",
      crowdHeight: Math.round(crowdRect?.height ?? 0),
      crowdTop: Math.round(crowdRect?.top ?? 0),
      petBottom: Math.round(petRect?.bottom ?? 0),
      petViewportBottomGap: Math.round(window.innerHeight - (petRect?.bottom ?? 0)),
    };
  };
  const footerClearance = await readFooterClearance();

  return {
    exists: Boolean(pet),
    tagName: pet?.tagName ?? "",
    tabIndex: pet?.tabIndex ?? -1,
    type: pet?.getAttribute("type") ?? "",
    label: pet?.getAttribute("aria-label") ?? "",
    source: pet?.getAttribute("data-site-pet-source") ?? "",
    clarity: pet?.getAttribute("data-pet-clarity") ?? "",
    motion: pet?.getAttribute("data-pet-motion") ?? "",
    state: pet?.getAttribute("data-pet-state") ?? "",
    direction: pet?.getAttribute("data-pet-direction") ?? "",
    clickState,
    keyState,
    spriteBackground: sprite ? getComputedStyle(sprite).backgroundImage : "",
    spriteBackgroundSize: sprite ? getComputedStyle(sprite).backgroundSize : "",
    overflow: petStyle?.overflow ?? "",
    hasNestedImage: Boolean(pet?.querySelector("img")),
    hasTentacleParts: Boolean(pet?.querySelector(".site-pet-tentacle")),
    position: rect ? {
      bottom: Math.round(window.innerHeight - rect.bottom),
      height: Math.round(rect.height),
      left: Math.round(rect.left),
      right: Math.round(window.innerWidth - rect.right),
      width: Math.round(rect.width),
    } : null,
    viewportWidth: window.innerWidth,
    transform: initialTransform,
    initialSpriteAnimation,
    leftWalkAnimation,
    upWalkAnimation,
    pettedSpriteAnimation,
    avoidance,
    footerClearance,
  };
});

await browser.close();

const failures = [...staticFailures];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (!report.exists) failures.push("Site pet is missing from the page.");
if (report.tagName !== "BUTTON") failures.push(`Site pet should use native button semantics: tag=${report.tagName}.`);
if (report.type !== "button") failures.push(`Site pet button should not submit forms: type=${report.type}.`);
if (report.tabIndex !== 0) failures.push(`Site pet should be focusable: tabindex=${report.tabIndex}.`);
if (report.label !== "Pet Synqora site companion") failures.push(`Site pet aria-label is unclear: ${report.label}`);
if (report.source !== "derDere/site-pet") failures.push(`Site pet should attribute the interaction source: ${report.source}`);
if (report.clarity !== "high") failures.push(`Site pet should declare high clarity mode: ${report.clarity}`);
if (report.hasNestedImage) failures.push("Site pet should not render a nested img element.");
if (report.hasTentacleParts) failures.push("Site pet should use a cohesive sprite sheet, not separate tentacle parts.");
if (!report.spriteBackground.includes("synqora-pet-sprite.svg")) failures.push(`Site pet sprite should use the local sprite sheet: ${report.spriteBackground}`);
if (!report.spriteBackgroundSize.includes("800%") || !report.spriteBackgroundSize.includes("900%")) {
  failures.push(`Site pet sprite should expose 8x9 frame sizing: ${report.spriteBackgroundSize}`);
}
if (report.overflow !== "hidden") failures.push(`Site pet should clip to a single sprite frame: overflow=${report.overflow}`);
if (!report.initialSpriteAnimation.includes("site-pet-frame-idle-one")) {
  failures.push(`Sprite should idle with frame animation: ${report.initialSpriteAnimation}`);
}
if (!report.leftWalkAnimation.includes("site-pet-frame-walk-left")) {
  failures.push(`Sprite should use the left walk row when moving left: ${report.leftWalkAnimation}`);
}
if (!report.upWalkAnimation.includes("site-pet-frame-walk-up")) {
  failures.push(`Sprite should use the up walk row when moving up: ${report.upWalkAnimation}`);
}
if (!report.pettedSpriteAnimation.includes("site-pet-frame-petted")) {
  failures.push(`Sprite should switch to petted frame row on click: ${report.pettedSpriteAnimation}`);
}
if (!["active", "reduced"].includes(report.motion)) failures.push(`Site pet motion state is missing: ${report.motion}`);
if (report.clickState !== "petted") failures.push(`Click should pet the companion, got state ${report.clickState}.`);
if (report.keyState !== "petted") failures.push(`Enter key should pet the companion, got state ${report.keyState}.`);
if (!report.position || report.position.width < 56 || report.position.height < 56) {
  failures.push(`Site pet should render at tappable size: ${JSON.stringify(report.position)}.`);
}
if (report.position && report.position.bottom > 40) {
  failures.push(`Site pet should roam along the bottom edge, not over section text: ${JSON.stringify(report.position)}.`);
}
if (report.avoidance.services.avoid !== "right") {
  failures.push(`Right-aligned sections should mark the right side as text to avoid: ${JSON.stringify(report.avoidance.services)}.`);
}
if (report.avoidance.services.petRight > report.avoidance.services.copyLeft - 32) {
  failures.push(`Pet should move to the left safe corner on right-aligned services text: ${JSON.stringify(report.avoidance.services)}.`);
}
if (report.avoidance.contact.petRight > report.avoidance.contact.copyLeft - 32) {
  failures.push(`Pet should avoid the right contact copy: ${JSON.stringify(report.avoidance.contact)}.`);
}
if (report.avoidance.method.avoid !== "left") {
  failures.push(`Left-aligned sections should mark the left side as text to avoid: ${JSON.stringify(report.avoidance.method)}.`);
}
if (report.avoidance.method.petLeft < report.avoidance.method.copyRight + 32) {
  failures.push(`Pet should move to the right safe corner on left-aligned method text: ${JSON.stringify(report.avoidance.method)}.`);
}
if (report.footerClearance.footerState !== "above-crowd") {
  failures.push(`Footer should mark the pet as lifted above the crowd: ${JSON.stringify(report.footerClearance)}.`);
}
if (report.footerClearance.petBottom > report.footerClearance.crowdTop - 10) {
  failures.push(`Pet should stay above the people canvas, not overlap it: ${JSON.stringify(report.footerClearance)}.`);
}
if (!report.transform || report.transform === "none") {
  failures.push("Site pet should be positioned with transform for cheap movement.");
}

if (failures.length > 0) {
  throw new Error(`Site pet failed:\n${failures.join("\n")}\n\n${JSON.stringify(report, null, 2)}`);
}

console.log(`Site pet passed: ${report.motion} ${report.state} sprite companion at ${report.position.width}x${report.position.height}.`);

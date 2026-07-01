import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const expectedAssets = [
  "public/images/work/exkitchens-desktop.jpg",
  "public/images/work/holditdown-desktop.jpg",
];

const staticFailures = [];
[
  "const workProjects",
  "function SelectedWorkPreview",
  "selected-work-preview",
  "https://www.exkitchens.com",
  "https://www.holditdown.uk",
  "ExKitchens",
  "Hold It Down",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) staticFailures.push(`Missing selected work token: ${token}`);
});

expectedAssets.forEach((asset) => {
  if (!existsSync(resolve(root, asset))) staticFailures.push(`Missing selected work preview asset: ${asset}`);
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
await page.waitForTimeout(900);

const desktopReports = [];
for (const id of ["work-exkitchens", "work-holditdown"]) {
  const exists = await page.locator(`#${id}`).count();
  if (exists === 0) {
    desktopReports.push({ id, missing: true });
    continue;
  }

  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  desktopReports.push(await page.evaluate((screenId) => {
    const screen = document.getElementById(screenId);
    const copy = screen?.querySelector(".screen-copy");
    const preview = screen?.querySelector(".selected-work-preview");
    const image = screen?.querySelector(".selected-work-preview img");
    const link = screen?.querySelector(".selected-work-link");
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
      align: screen?.getAttribute("data-align") ?? "",
      copy: rectOf(copy),
      id: screenId,
      imageAlt: image?.getAttribute("alt") ?? "",
      imageComplete: Boolean(image?.complete),
      imageNaturalWidth: image?.naturalWidth ?? 0,
      link: rectOf(link),
      linkHref: link?.getAttribute("href") ?? "",
      linkText: link?.textContent?.trim() ?? "",
      preview: rectOf(preview),
      title: screen?.querySelector(".screen-title")?.textContent?.trim() ?? "",
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  }, id));
}

const mobilePage = await browser.newPage({
  deviceScaleFactor: 3,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});
await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });
const mobilePanelExists = await mobilePage.locator("#work-exkitchens").count();
if (mobilePanelExists > 0) {
  await mobilePage.locator("#work-exkitchens").scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
}
const mobileReport = mobilePanelExists === 0 ? { missing: true } : await mobilePage.evaluate(() => {
  const screen = document.querySelector("#work-exkitchens");
  const preview = screen?.querySelector(".selected-work-preview");
  const copy = screen?.querySelector(".screen-copy");
  const link = screen?.querySelector(".selected-work-link");
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
    link: rectOf(link),
    preview: rectOf(preview),
    screen: rectOf(screen),
    viewportHeight: window.innerHeight,
  };
});

await browser.close();

const failures = [...staticFailures];
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);

if (desktopReports.length !== 2) failures.push(`Expected two selected work panels, got ${desktopReports.length}.`);
desktopReports.forEach((report) => {
  if (report.missing) {
    failures.push(`Selected work panel is missing: ${report.id}.`);
    return;
  }
  if (!report.title) failures.push(`Selected work panel is missing a title: ${JSON.stringify(report)}.`);
  if (!report.preview || report.preview.width < 560 || report.preview.height < 320) {
    failures.push(`Selected work preview should be a large visual, not a small card: ${JSON.stringify(report.preview)}.`);
  }
  if (!report.copy || !report.preview) {
    failures.push(`Selected work copy and preview should both render: ${JSON.stringify(report)}.`);
  } else if (report.align === "left" && report.copy.right > report.preview.left - 64) {
    failures.push(`Selected work left copy and preview should have clear desktop separation: ${JSON.stringify(report)}.`);
  } else if (report.align === "right" && report.preview.right > report.copy.left - 64) {
    failures.push(`Selected work right copy and preview should have clear desktop separation: ${JSON.stringify(report)}.`);
  }
  if (!report.imageComplete || report.imageNaturalWidth < 900) {
    failures.push(`Selected work preview image should load from a high-quality local screenshot: ${JSON.stringify(report)}.`);
  }
  if (!report.imageAlt.includes(report.title)) {
    failures.push(`Selected work image alt text should name the project: ${JSON.stringify(report)}.`);
  }
  if (!report.linkHref.startsWith("https://www.") || report.linkText !== "Visit live site") {
    failures.push(`Selected work should expose a clear live link: ${JSON.stringify(report)}.`);
  }
});

if (!mobileReport.screen || Math.abs(mobileReport.screen.height - mobileReport.viewportHeight) > 2) {
  failures.push(`Mobile selected work should still be one full screen: ${JSON.stringify(mobileReport)}.`);
}
if (!mobileReport.preview || mobileReport.preview.width < 320 || mobileReport.preview.bottom > mobileReport.viewportHeight - 48) {
  failures.push(`Mobile selected work preview should fit cleanly under the text: ${JSON.stringify(mobileReport)}.`);
}
if (!mobileReport.link || mobileReport.link.bottom > mobileReport.viewportHeight - 36) {
  failures.push(`Mobile selected work live link should stay visible: ${JSON.stringify(mobileReport)}.`);
}

if (failures.length > 0) {
  throw new Error(`Selected work failed:\n${failures.join("\n")}\n\n${JSON.stringify({ desktopReports, mobileReport }, null, 2)}`);
}

console.log("Selected work passed.");

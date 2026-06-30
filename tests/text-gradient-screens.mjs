import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:5173/";
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const manifest = readFileSync(resolve(root, "public/site.webmanifest"), "utf8");

const staticFailures = [];
const requiredContentTokens = [
  "Websites and AI systems.",
  "Founder-led builds from idea to launch.",
  "Websites",
  "AI assistants",
  "automations",
  "internal tools",
  "Clear strategy. Fast build. Practical handoff.",
  "From idea to working product.",
  "Tell us what you want to build.",
  "info@synqora.tech",
  "Synqora AI | Premium Websites and AI Systems",
];

[
  "const textScreens",
  "screen-gradient",
  "screen-title",
  "screen-copy",
  "HeroShaderGradient",
  "email-link",
  "mailto:info@synqora.tech",
].forEach((token) => {
  if (!app.includes(token) && !css.includes(token)) {
    staticFailures.push(`Missing text-only screen token: ${token}`);
  }
});

requiredContentTokens.forEach((token) => {
  if (!app.includes(token) && !html.includes(token) && !manifest.includes(token)) {
    staticFailures.push(`Missing approved agency content: ${token}`);
  }
});

[
  "hero-tool-visual",
  "services-gallery-feature",
  "depth-gallery-card",
  "example-card",
  "brief-form",
  "<picture",
  "<img",
  "getBoundingClientRect",
  "--screen-presence",
  "AI training and implementation",
  "Turn one slow task into an AI tool.",
  "Premium websites and AI systems, built for modern teams.",
  "Synqora turns your offer, workflow, or idea",
  "Founder-led strategy, design, and implementation.",
  "Learn AI. Build AI. Deploy AI.",
  "teaches teams how to use AI",
  "AI Training",
  "hello@synqora.ai",
].forEach((token) => {
  if (app.includes(token) || css.includes(`.${token}`) || html.includes(token) || manifest.includes(token)) {
    staticFailures.push(`Text-only pass still includes removed surface: ${token}`);
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
await page.waitForTimeout(1600);

const report = await page.evaluate(() => {
  const screens = [...document.querySelectorAll(".text-screen")];
  const wordmark = document.querySelector(".wordmark");
  const hero = document.querySelector("#hero");
  const hasForbiddenUi = Boolean(document.querySelector("button:not(.contact-submit), nav, img, picture, .screen-nav, .hero-tool-visual, .depth-gallery-card, .example-card, .brief-form"));
  const readScreen = (screen) => {
    const rect = screen.getBoundingClientRect();
    const style = getComputedStyle(screen);
    const copyGroup = screen.querySelector(".screen-copy");
    const title = screen.querySelector(".screen-title");
    const copy = screen.querySelector(".screen-copy-line");
    const note = screen.querySelector(".screen-note");
    const rectOf = (element) => {
      const elementRect = element?.getBoundingClientRect();
      return elementRect
        ? {
          bottom: Math.round(elementRect.bottom),
          height: Math.round(elementRect.height),
          left: Math.round(elementRect.left),
          right: Math.round(elementRect.right),
          top: Math.round(elementRect.top),
          width: Math.round(elementRect.width),
        }
        : null;
    };

    return {
      backgroundImage: style.backgroundImage,
      copyGroupBox: rectOf(copyGroup),
      copyColor: copy ? getComputedStyle(copy).color : "",
      height: Math.round(rect.height),
      id: screen.id,
      noteColor: note ? getComputedStyle(note).color : "",
      title: title?.textContent?.trim() ?? "",
      titleBox: rectOf(title),
      titleColor: title ? getComputedStyle(title).color : "",
    };
  };

  const firstScrollY = window.scrollY;
  window.scrollTo({ top: window.innerHeight * 1.2, behavior: "instant" });
  window.dispatchEvent(new Event("scroll"));
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve({
          secondScreenTop: Math.round(screens[1]?.getBoundingClientRect().top ?? 9999),
          bodyHeight: document.documentElement.scrollHeight,
          firstScrollY,
          forbiddenUi: hasForbiddenUi,
          wordmarkVisible: Boolean(wordmark),
          hero: {
            title: hero?.querySelector(".screen-title")?.textContent?.trim() ?? "",
            copy: hero?.querySelector(".screen-copy-line")?.textContent?.trim() ?? "",
            noteExists: Boolean(hero?.querySelector(".screen-note")),
          },
          contactVisibleEmailCount: document.querySelectorAll("#contact .email-link").length,
          screenCount: screens.length,
          screens: screens.map(readScreen),
          scrolledY: Math.round(window.scrollY),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        });
      });
    });
  });
});

const desktopFitReports = [];
for (const id of ["services", "method", "examples", "answers", "contact"]) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(420);
  desktopFitReports.push(await page.evaluate((screenId) => {
    const screen = document.getElementById(screenId);
    const copyGroup = screen?.querySelector(".screen-copy");
    const title = screen?.querySelector(".screen-title");
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
      id: screenId,
      copyGroupBox: rectOf(copyGroup),
      titleBox: rectOf(title),
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  }, id));
}

await page.locator("#contact").scrollIntoViewIfNeeded();

await browser.close();

const failures = [...staticFailures];
const colorChannels = (color) => {
  const channels = color.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number) ?? [];
  return channels.length === 3 ? channels : [255, 255, 255];
};
const isDarkText = (color) => {
  const [r, g, b] = colorChannels(color);
  return r < 70 && g < 70 && b < 70;
};
const isLightText = (color) => {
  const [r, g, b] = colorChannels(color);
  return r > 210 && g > 210 && b > 210;
};
if (errors.length > 0) failures.push(`Console/page errors: ${errors.join(" | ")}`);
if (report.forbiddenUi) failures.push("Rendered page still includes buttons, navigation, images, forms, or card surfaces.");
if (report.screenCount < 5) failures.push(`Expected at least 5 text screens, found ${report.screenCount}.`);
if (!report.wordmarkVisible) failures.push("Centered wordmark text is missing.");
if (report.hero.title !== "Websites and AI systems.") {
  failures.push(`Hero title should be shorter: ${report.hero.title}`);
}
if (report.hero.copy.length > 48) {
  failures.push(`Hero copy is still too long: ${report.hero.copy.length} characters.`);
}
if (report.hero.noteExists) {
  failures.push("Hero should not render an extra note line.");
}
if (report.contactVisibleEmailCount !== 0) {
  failures.push(`Contact screen should not show the email after adding the form: ${report.contactVisibleEmailCount}.`);
}
desktopFitReports.forEach((screen) => {
  if (screen.copyGroupBox) {
    if (screen.copyGroupBox.top < 96 || screen.copyGroupBox.bottom > screen.viewportHeight - 56) {
      failures.push(`Desktop ${screen.id} text group should fit comfortably in one viewport: ${JSON.stringify(screen.copyGroupBox)}.`);
    }
    if (screen.copyGroupBox.right > screen.viewportWidth - 56 || screen.copyGroupBox.left < 56) {
      failures.push(`Desktop ${screen.id} text group should not sit against the browser edge: ${JSON.stringify(screen.copyGroupBox)}.`);
    }
  }
  if (screen.titleBox) {
    if (screen.titleBox.height > screen.viewportHeight * 0.52) {
      failures.push(`Desktop ${screen.id} heading wraps into a too-tall column: ${JSON.stringify(screen.titleBox)}.`);
    }
    if (screen.titleBox.width < 520) {
      failures.push(`Desktop ${screen.id} heading measure is too narrow to read comfortably: ${JSON.stringify(screen.titleBox)}.`);
    }
  }
});
report.screens.forEach((screen, index) => {
  if (screen.height < report.viewportHeight * 0.94) {
    failures.push(`Screen ${index + 1} is not viewport-height: ${screen.height}px.`);
  }
  if (!screen.backgroundImage.includes("gradient")) {
    failures.push(`Screen ${index + 1} does not use a gradient background.`);
  }
  if (!screen.title) failures.push(`Screen ${index + 1} is missing title text.`);
  if (!isLightText(screen.titleColor)) {
    failures.push(`Screen ${index + 1} heading should stay light: ${screen.titleColor}.`);
  }
  if (!isDarkText(screen.copyColor)) {
    failures.push(`Screen ${index + 1} supporting copy should be black/dark: ${screen.copyColor}.`);
  }
  if (screen.noteColor && !isDarkText(screen.noteColor)) {
    failures.push(`Screen ${index + 1} note should be black/dark: ${screen.noteColor}.`);
  }
});
if (report.scrolledY <= report.firstScrollY) {
  failures.push(`Page did not move with native scroll: ${report.firstScrollY} -> ${report.scrolledY}.`);
}
if (Math.abs(report.secondScreenTop) > report.viewportHeight * 0.5) {
  failures.push(`Second screen is not naturally reachable after one scroll: top=${report.secondScreenTop}.`);
}

if (failures.length > 0) {
  throw new Error(`Text gradient screens failed:\n${failures.join("\n")}\n\n${JSON.stringify({ report, desktopFitReports }, null, 2)}`);
}

console.log(`Text gradient screens passed: ${report.screenCount} full-screen gradient text sections.`);

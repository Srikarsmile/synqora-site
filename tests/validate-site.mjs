import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const requiredAppTokens = [
  "const textScreens",
  "function HeroShaderGradient",
  "function TextScreen",
  "function useElementVisibility",
  "function useMediaQuery",
  "IntersectionObserver",
  "useSyncExternalStore",
  "const renderShader = allowWebGL && shaderActive",
  'animate="on"',
  'color1="#ff5005"',
  'color2="#dbba95"',
  'color3="#d0bce1"',
  'type="plane"',
  'grain="off"',
  "pixelDensity={1}",
  "uDensity={1.3}",
  "uFrequency={5.5}",
  "uSpeed={0.4}",
  "uStrength={4}",
];

const requiredCssTokens = [
  "-apple-system",
  ".site-header",
  ".wordmark",
  ".text-screen",
  ".screen-gradient-hero",
  ".screen-gradient-services",
  ".screen-copy",
  ".screen-title",
  ".hero-shader-backdrop",
  ".hero-shader-canvas",
  "depth-gallery-drift",
  "contain: layout paint style",
];

const forbiddenTokens = [
  "gsap",
  "@gsap/react",
  "ScrollTrigger",
  "hero-tool-visual",
  "services-gallery-feature",
  "depth-gallery-card",
  "example-card",
  "brief-form",
  "<img",
  "<picture",
];

const checks = [
  ["ShaderGradient dependency", Boolean(pkg.dependencies?.["@shadergradient/react"])],
  ["React Three Fiber dependency", Boolean(pkg.dependencies?.["@react-three/fiber"])],
  ["Three dependency", Boolean(pkg.dependencies?.three)],
  ["GSAP dependencies removed", !pkg.dependencies?.gsap && !pkg.dependencies?.["@gsap/react"]],
  ["App keeps the required text-gradient structure", requiredAppTokens.every((token) => app.includes(token))],
  ["CSS keeps the required full-screen gradient structure", requiredCssTokens.every((token) => css.includes(token))],
  ["Old card/image surfaces removed", forbiddenTokens.every((token) => !app.includes(token) && !css.includes(token))],
  ["Contact form is the only restored form surface", app.includes("contact-form") && app.includes("function ContactForm")],
  [
    "Depth scroll uses an idle scheduler instead of a continuous render loop",
    app.includes("scheduleDepthFrame")
      && app.includes("stopDepthFrame")
      && app.includes("data-depth-scroll-state")
      && !app.includes("getBoundingClientRect")
      && !app.includes("requestAnimationFrame(render)"),
  ],
  ["No unused hero image preload", !html.includes('rel="preload"') && !html.includes("synqora-hero-nano.webp")],
  ["No external font stylesheet", !html.includes("fonts.googleapis.com") && !html.includes("fonts.gstatic.com")],
  ["HTML root loader is text-only", !html.includes("<img") && html.includes("Loading")],
  ["Typography uses system Apple stack", css.includes("-apple-system") && css.includes("SF Pro Display")],
  ["Typography does not use negative tracking", !css.includes("letter-spacing: -")],
  ["Typography does not scale font-size with viewport width", !css.match(/font-size:[^;]*(vw|svw|lvw|dvw)/)],
];

const failed = checks.filter(([, ok]) => !ok);

if (failed.length > 0) {
  console.error("Validation failed:");
  for (const [name] of failed) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log(`Validation passed: ${checks.length}/${checks.length} checks`);

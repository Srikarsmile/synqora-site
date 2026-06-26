import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const checks = [
  ["GSAP dependency", Boolean(pkg.dependencies?.gsap)],
  ["GSAP import", app.includes('import { gsap } from "gsap";')],
  ["scoped GSAP context", app.includes("gsap.context") && app.includes("ctx.revert")],
  ["reduced motion guard", app.includes("prefers-reduced-motion: reduce") && css.includes("prefers-reduced-motion: reduce")],
  ["scroll reveal observer", app.includes("IntersectionObserver") && app.includes("reveal-block")],
  ["robust landing scroll reset", app.includes("resetTimers") && app.includes("pageshow") && app.includes("load") && app.includes("setTimeout(scrollToTop, delay)")],
  ["new hero component", app.includes("function KineticHero") && app.includes("Make AI feel useful.")],
  ["plain hero promise", app.includes("Learn what AI can do, then build one tool your team actually uses.")],
  ["animated shape component", app.includes("function AnimatedShape") && app.includes("shape-orbit")],
  ["pain point chooser", app.includes("function PainPointChooser") && app.includes("Start with one painful task.")],
  ["problem outcome cards", app.includes("function ProblemOutcomeCard") && app.includes("problem:") && app.includes("result:")],
  ["method strip", app.includes("function MethodStrip") && app.includes("Learn") && app.includes("Use")],
  ["examples section", app.includes("function ExampleTransformations") && app.includes("Before") && app.includes("After")],
  ["contact brief", app.includes("function ContactBrief") && app.includes("What work takes too much time?")],
  ["split footer", app.includes("function SplitFooter") && app.includes("footer-split-char")],
  ["polished cursor follower", app.includes("function CursorFollower") && app.includes("cursor-follower") && app.includes("pointermove") && css.includes(".cursor-follower") && css.includes(".cursor-follower.is-active")],
  ["non-technical copy", app.includes("non-technical") && app.includes("plain English")],
  ["local Synqora logo", app.includes("/assets/brand/synqora-gradient-wordmark.svg")],
  ["Nano image assets", app.includes("synqora-hero-nano.webp") && app.includes("synqora-training-nano.webp") && app.includes("synqora-rag-nano.webp") && app.includes("synqora-automation-nano.webp")],
  ["old cursor removed", !app.includes("TutorialCursor") && !app.includes("cursor-echo") && !css.includes(".tutorial-cursor")],
  ["React Bits removed", !app.includes("ReactBitsBackdrop") && !app.includes("bits-star-border") && !app.includes("bits-spotlight") && !css.includes("bits-star-border")],
  ["old hero removed", !app.includes("Understand AI. Use it at work. Get useful tools built.")],
  ["no service search catalog", !app.includes("serviceSearch") && !app.includes("Search services") && !css.includes(".service-search")],
  ["new color system", css.includes("#fffce1") && css.includes("#0cff62") && css.includes("--ink")],
  ["kinetic hero CSS", css.includes(".kinetic-hero") && css.includes(".hero-word") && css.includes(".hero-brace")],
  ["height-aware hero fit", css.includes("@media (max-height: 980px) and (min-width: 900px)") && css.includes("font-size: clamp(5.6rem, 13svh, 7.7rem)") && css.includes("height: clamp(420px, 56svh, 520px)")],
  ["acid pill buttons", css.includes(".acid-pill") && css.includes(".ghost-pill")],
  ["hero ticker does not overlap", css.includes(".ticker") && !css.includes("margin: -34px auto 0")],
  ["shape animation CSS", css.includes(".animated-shape") && css.includes(".shape-orbit")],
  ["simplified service cards", css.includes(".pain-point-chooser") && css.includes(".problem-card") && css.includes(".problem-card::before")],
  ["aligned section headings", css.includes(".section-heading {") && css.includes("max-width: 920px") && !css.includes("grid-template-columns: minmax(0, 0.9fr) minmax(280px, 0.5fr)")],
  ["roomier offer cards", css.includes("grid-template-columns: repeat(3, minmax(0, 1fr))") && !css.includes("grid-template-columns: repeat(5, minmax(0, 1fr))")],
  ["method strip CSS", css.includes(".method-strip") && css.includes(".method-step")],
  ["proof cards CSS", css.includes(".example-card") && css.includes(".before-after")],
  ["contact CSS", css.includes(".contact-brief") && css.includes(".brief-form")],
  ["split footer CSS", css.includes(".split-footer") && css.includes(".footer-split-word")],
  ["responsive rules", css.includes("@media (max-width: 760px)") && css.includes("overflow-x: hidden")],
  ["metadata title", html.includes("Synqora AI")],
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

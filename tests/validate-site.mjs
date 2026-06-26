import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const checks = [
  ["GSAP dependency", Boolean(pkg.dependencies?.gsap)],
  ["GSAP React helper", Boolean(pkg.dependencies?.["@gsap/react"]) && app.includes('import { useGSAP } from "@gsap/react";')],
  ["GSAP import", app.includes('import { gsap } from "gsap";')],
  ["ScrollTrigger import", app.includes('import { ScrollTrigger } from "gsap/ScrollTrigger";') && app.includes("gsap.registerPlugin(useGSAP, ScrollTrigger")],
  ["Observer story slider removed", !app.includes('import { Observer } from "gsap/Observer";') && !app.includes("Observer.create") && !app.includes("story-slider") && !app.includes("SwipeStoryDeck")],
  ["MotionPath plugin import", app.includes('import { MotionPathPlugin } from "gsap/MotionPathPlugin";') && app.includes("MotionPathPlugin") && app.includes("motionPath")],
  ["MorphSVG plugin import", app.includes('import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";') && app.includes("MorphSVGPlugin") && app.includes("morphSVG")],
  ["scoped GSAP context", app.includes("useGSAP(") && app.includes("scope: rootRef")],
  ["reduced motion guard", app.includes("prefers-reduced-motion: reduce") && css.includes("prefers-reduced-motion: reduce")],
  ["ScrollTrigger reveal batches", app.includes("ScrollTrigger.batch") && app.includes("reveal-block") && app.includes("gsap.matchMedia")],
  ["robust landing scroll reset", app.includes("resetTimers") && app.includes("pageshow") && app.includes("load") && app.includes("setTimeout(scrollToTop, delay)")],
  ["new hero component", app.includes("function KineticHero") && app.includes("Make AI feel useful.")],
  ["GSAP scale hero markup", app.includes("hero-mega") && app.includes("kinetic-spark") && app.includes("hero-brace-copy") && app.includes("motion-orb") && app.includes("data-motion-word")],
  ["Morphing SVG hero mark", app.includes("function MorphingHeroMark") && app.includes("hero-morph-mark") && app.includes("hero-morph-shape") && app.includes("hero-morph-target")],
  ["GSAP hero timeline labels", app.includes("heroTl.addLabel(\"copy\"") && app.includes("heroTl.addLabel(\"actions\"") && app.includes("heroTl.addLabel(\"proof\"")],
  ["GSAP scale section motion", app.includes("section-marquee") && app.includes("service-rail-card") && app.includes("gsapScaleHero")],
  ["plain hero promise", app.includes("Learn what AI can do, then build one tool your team actually uses.")],
  ["animated shape component", app.includes("function AnimatedShape") && app.includes("shape-orbit")],
  ["pain point chooser", app.includes("function PainPointChooser") && app.includes("Start with one painful task.")],
  ["common fixes slider section removed", !app.includes("Swipe or scroll through common AI fixes.") && !app.includes("storyIndex") && !app.includes("goToStory")],
  ["problem outcome cards", app.includes("function ProblemOutcomeCard") && app.includes("problem:") && app.includes("result:")],
  ["method strip", app.includes("function MethodStrip") && app.includes("Learn") && app.includes("Use")],
  ["MotionPath method route", app.includes("method-route-path") && app.includes("method-route-dot") && app.includes("method-route-waypoint")],
  ["examples section", app.includes("function ExampleTransformations") && app.includes("Before") && app.includes("After")],
  ["contact brief", app.includes("function ContactBrief") && app.includes("What work takes too much time?")],
  ["split footer", app.includes("function SplitFooter") && app.includes("footer-split-char")],
  ["green arrow cursor follower", app.includes("function CursorFollower") && app.includes("cursor-arrow") && app.includes("cursor-trail-dot") && app.includes("dotRefs") && app.includes("pointermove") && css.includes(".cursor-arrow") && css.includes(".cursor-trail-dot") && css.includes("cursor: none !important")],
  ["cursor trail follows behind pointer", app.includes("cursorTrailHistoryRef") && app.includes("cursorTrailLag") && app.includes("cursorTrailBackOffset") && app.includes("historyPoint")],
  ["polished nav shell", app.includes("site-header-shell") && app.includes("nav-link") && css.includes(".site-header-shell") && css.includes(".desktop-nav::before") && css.includes(".nav-link")],
  ["hero composition no dead chips", !app.includes("hero-proof-row") && css.includes(".hero-method-capsule") && css.includes(".hero-action-deck")],
  ["method section no tall column wall", app.includes("method-step-index") && app.includes("method-output") && css.includes(".method-step-index") && css.includes(".method-output") && css.includes("grid-template-columns: 1fr;")],
  ["non-technical copy", app.includes("non-technical") && app.includes("plain English")],
  ["local Synqora logo", app.includes("/assets/brand/synqora-gradient-wordmark.svg")],
  ["Nano image assets", app.includes("synqora-hero-nano.webp") && app.includes("synqora-training-nano.webp") && app.includes("synqora-rag-nano.webp") && app.includes("synqora-automation-nano.webp")],
  ["old cursor removed", !app.includes("TutorialCursor") && !app.includes("cursor-echo") && !css.includes(".tutorial-cursor")],
  ["React Bits removed", !app.includes("ReactBitsBackdrop") && !app.includes("bits-star-border") && !app.includes("bits-spotlight") && !css.includes("bits-star-border")],
  ["old hero removed", !app.includes("Understand AI. Use it at work. Get useful tools built.")],
  ["no service search catalog", !app.includes("serviceSearch") && !app.includes("Search services") && !css.includes(".service-search")],
  ["new color system", css.includes("#fffce1") && css.includes("#0cff62") && css.includes("--ink")],
  ["kinetic hero CSS", css.includes(".kinetic-hero") && css.includes(".hero-word") && css.includes(".hero-brace-copy")],
  ["GSAP scale hero CSS", css.includes(".hero-mega") && css.includes(".kinetic-spark") && css.includes(".hero-brace-copy") && css.includes(".motion-orb") && css.includes(".section-marquee") && css.includes(".service-rail-card")],
  ["Morphing SVG hero CSS", css.includes(".hero-morph-mark") && css.includes(".hero-morph-shape") && css.includes(".hero-morph-target") && css.includes(".hero-morph-label")],
  ["height-aware hero fit", css.includes("@media (max-height: 980px) and (min-width: 900px)") && css.includes("font-size: clamp(6.8rem, min(14.2vw, 18.8svh), 18rem)") && css.includes("min-height: min(700px, calc(100svh - 220px))")],
  ["acid pill buttons", css.includes(".acid-pill") && css.includes(".ghost-pill")],
  ["hero ticker does not overlap", css.includes(".ticker") && !css.includes("margin: -34px auto 0")],
  ["shape animation CSS", css.includes(".animated-shape") && css.includes(".shape-orbit")],
  ["simplified service cards", css.includes(".pain-point-chooser") && css.includes(".problem-card") && css.includes(".problem-card::before")],
  ["aligned section headings", css.includes(".section-heading {") && css.includes("max-width: 920px") && !css.includes("grid-template-columns: minmax(0, 0.9fr) minmax(280px, 0.5fr)")],
  ["roomier offer cards", css.includes("grid-template-columns: repeat(3, minmax(0, 1fr))") && !css.includes("grid-template-columns: repeat(5, minmax(0, 1fr))")],
  ["method strip CSS", css.includes(".method-strip") && css.includes(".method-step")],
  ["common fixes slider CSS removed", !css.includes(".story-slider") && !css.includes(".story-slide.is-active") && !css.includes(".story-progress-fill")],
  ["MotionPath route CSS", css.includes(".method-route") && css.includes(".method-route-path") && css.includes(".method-route-dot")],
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

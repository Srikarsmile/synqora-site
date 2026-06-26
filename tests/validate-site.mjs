import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");

const checks = [
  ["brand copy", app.includes("Synqora AI")],
  ["hero promise", app.includes("Understand AI. Use it at work. Get useful tools built.")],
  ["simple stage interaction", app.includes("onFocus={() => setActiveStage(service.id)}") && !app.includes("onPointerMove") && !app.includes("floatingPreview")],
  ["service filters", app.includes("activeFilter") && app.includes("AI help for non-technical teams")],
  ["contact shortcut", app.includes("keydown") && app.includes("contact")],
  ["form feedback", app.includes("briefStatus")],
  ["local bitmap assets", app.includes("/assets/nano/synqora-hero-nano.webp")],
  ["Nano Banana service assets", app.includes("synqora-training-nano.webp") && app.includes("synqora-agents-nano.webp") && app.includes("synqora-automation-nano.webp") && app.includes("synqora-rag-nano.webp") && app.includes("synqora-website-tools-nano.webp") && app.includes("synqora-voice-chat-nano.webp") && !app.includes("synqora-apps-rag-nano.webp")],
  ["simple stage hover", css.includes(".service-stage") && css.includes(".stage-item.is-active::before") && !css.includes(".stage-item.is-muted")],
  ["responsive mobile fallback", css.includes("@media (max-width: 760px)")],
  ["metadata title", html.includes("Synqora AI")],
  ["gradient wordmark logo", app.includes("/assets/brand/synqora-gradient-wordmark.svg") && css.includes(".brand-logo") && html.includes("/assets/brand/synqora-gradient-wordmark.svg")],
  ["simplified hero hierarchy", app.includes("hero-simple-grid") && app.includes("hero-step-grid") && !app.includes("hero-wordmark") && !app.includes("hero-intel")],
  ["typography system", css.includes("--font-display") && css.includes("text-wrap: balance")],
  ["stronger service UX", app.includes("service-index") && css.includes(".service-card::before")],
  ["premium process layout", app.includes("method-spine") && css.includes(".method-step::after")],
  ["simple hero styling", css.includes(".hero-simple-grid") && css.includes(".hero-step-card") && !css.includes(".hero-word-row") && css.includes("radial-gradient(circle")],
  ["service outcome metadata", app.includes("serviceMeta") && app.includes("time:") && app.includes("youGet:") && app.includes("You get")],
  ["method output clarity", app.includes("processOutputs") && app.includes("Output")],
  ["contact quick-entry options", app.includes("briefOptions") && app.includes("brief-choice")],
  ["refined visual density", css.includes(".hero-step-grid") && css.includes(".service-card-summary")],
  ["no service search catalog", !app.includes("serviceSearch") && !app.includes("serviceSuggestions") && !app.includes("Search services") && !css.includes(".service-search") && !css.includes(".service-suggestions")],
  ["visual service cards", app.includes("service-card-media") && app.includes("visual:") && css.includes(".service-card-media")],
  ["sticky section tabs", app.includes("sectionTabs") && css.includes(".section-tabs")],
  ["simplified cards", app.includes("service-card-summary") && app.includes("service-card-action") && app.includes("proof-comparison") && !app.includes("service-card-reveal") && !app.includes("proof-card-curtain") && !app.includes("service-card-author")],
  ["AI brief composer", app.includes("ai-composer") && css.includes(".composer-toolbar") && css.includes(".composer-send")],
  ["controlled CTA glyphs", app.includes("cta-glyph") && !app.includes("ri-arrow-right-up-line")],
  ["local icon glyphs", !html.includes("cdn.jsdelivr.net/npm/remixicon") && css.includes(".ri-menu-4-line::before")],
  ["no fixed background paint trap", !css.includes("background-attachment: fixed")],
  ["cursor-follow preview removed", !app.includes("previewRef") && !app.includes("latestPointerRef") && !app.includes("--preview-x")],
  ["custom cursor removed", !app.includes("cursor-layer") && !app.includes("cursorReticleRef") && !app.includes("paintCursor") && !css.includes(".cursor-reticle") && !css.includes("cursor-scan")],
  ["tutorial cursor follower", app.includes("TutorialCursor") && app.includes("data-cursor-image") && app.includes("tutorial-cursor-preview") && app.includes("cursor-echo") && app.includes("pointermove") && app.includes("requestAnimationFrame") && app.includes("prefers-reduced-motion: reduce") && app.includes("pointer: coarse") && css.includes(".tutorial-cursor") && css.includes(".cursor-echo") && css.includes(".tutorial-cursor.is-targeting") && css.includes("@media (pointer: coarse)") && !app.includes("PointerDotFollower")],
  ["simple non-search navigation", app.includes("menuOpen") && !app.includes("commandOpen") && !css.includes(".command-dialog")],
  ["shadcn primitive mapping", app.includes("shadcn-tabs") && app.includes("shadcn-toggle-group") && app.includes("shadcn-accordion") && app.includes("shadcn-popover")],
  ["shadcn badges and sheet", app.includes("ui-badge") && css.includes(".ui-badge") && css.includes("max-height: calc(100dvh - 104px)")],
  ["non-technical learner focus", app.includes("non-technical") && app.includes("plain English") && app.includes("everyday AI workflows")],
  ["plain language service names", app.includes("AI Assistant for Daily Tasks") && app.includes("Company Knowledge Helper") && !app.includes("Agentic Workflows") && !app.includes("RAG Knowledge Systems")],
  ["shadcn secondary button icon style", app.includes("SecondaryButtonIcon") && css.includes(".secondary-button-icon") && css.includes("margin-left: -4px")],
  ["matte card styling", app.includes("glass-blog-card") && css.includes(".glass-blog-card::after") && css.includes("backdrop-filter: none") && css.includes("0 18px 42px rgba(0, 0, 0, 0.28)") && !css.includes("backdrop-filter: blur(22px) saturate(140%)")],
  ["decorative numeric UI removed", !app.includes("filterCounts") && !app.includes("padStart(2") && !app.includes("method-number") && !app.includes("faq-index") && !app.includes("focused offers") && !css.includes(".filter-row button b") && !css.includes(".service-card-media small")],
  ["21st radial black violet background", css.includes("radial-gradient(125% 125% at 50% 10%, #000 40%, #63e 100%)") && css.includes("--background-radial-violet")],
  ["landing ignores stale hash scroll", app.includes("resetLandingScroll") && app.includes("scrollRestoration")],
  ["hash navigation reset guard", app.includes("hashchange") && app.includes("removeEventListener(\"hashchange\"")],
  ["deferred landing scroll correction", app.includes("setTimeout") && app.includes("scrollToTop")],
  ["mobile hero single CTA", css.includes(".hero-actions .secondary-action") && css.includes("display: none") && css.includes("height: clamp(150px, 46vw, 190px)")],
  ["plain CTA wording", app.includes("Plan this") && app.includes("Tell us what you need") && !app.toLowerCase().includes("sprint") && !app.includes("Brief this build") && !app.includes("New build sprint")],
  ["before after proof examples", app.includes("before:") && app.includes("after:") && app.includes("proof-comparison") && app.includes("Before") && app.includes("After")],
  ["decision focused service cards", app.includes("problem:") && app.includes("result:") && app.includes("service-card-summary") && !app.includes("service-card-details")],
  ["guided brief form", app.includes("What work takes too much time?") && app.includes("Who does this work now?") && app.includes("What tools do you already use?")],
  ["lighter lower section rhythm", css.includes(".proof-section {") && css.includes("rgba(244, 247, 251, 0.035)") && css.includes(".contact-section {") && css.includes("rgba(244, 247, 251, 0.04)")],
  ["split poster footer", app.includes("SplitFooterWord") && app.includes("split-footer") && app.includes("footer-poster") && app.includes("footer-split-char") && app.includes("footer-poster-line") && css.includes(".split-footer") && css.includes(".footer-poster") && css.includes(".footer-split-word") && css.includes(".footer-poster-line")],
  ["react bits inspired polish", app.includes("ReactBitsBackdrop") && app.includes("react-bits-backdrop") && app.includes("bits-spotlight") && app.includes("bits-star-border") && app.includes("handleBitsSpotlight") && css.includes(".react-bits-backdrop") && css.includes(".bits-grid-layer") && css.includes(".bits-spotlight-glow") && css.includes(".bits-star-border") && css.includes("@keyframes bits-star-sweep")],
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

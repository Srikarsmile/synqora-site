# Synqora Bold Kinetic Redesign

Date: 2026-06-26
Status: Design approved for review
Project: Synqora AI marketing site

## Goal

Redesign the Synqora homepage around a bold, clear, GSAP-inspired visual language while keeping the offer easy for non-technical people to understand.

The site should feel more memorable, more confident, and less card-heavy. It should borrow the useful lessons from GSAP's site: a near-black canvas, oversized friendly type, warm off-white text, acid green accents, simple pill navigation, and deliberate motion that explains the page instead of decorating every surface.

## Audience

Synqora is for non-technical founders, teams, schools, creators, and service businesses that want to understand AI and use it at work without jargon.

Primary audience mindset:

- They may not know what agents, RAG, workflows, or models mean.
- They do know which work feels slow, repetitive, confusing, or expensive.
- They need trust, clarity, and a simple first step.
- They should feel that Synqora can teach them and build something practical with them.

## Approved Direction

Use the "Bold kinetic hero" direction from the visual board.

Core idea:

> Make AI feel useful.

The homepage should lead with one strong promise, then quickly explain what Synqora does:

> Learn what AI can do, then build one tool your team actually uses.

This direction should be expressive, but not chaotic. The hero can be playful and animated, while the rest of the page should stay clear and grounded.

## Design Language

### Color

Use a palette closer to GSAP's homepage:

- Background: near-black, around `#0e100f` or darker.
- Primary text: warm off-white, around `#fffce1`.
- Primary accent: acid green, around `#0cff62`.
- Supporting accents: Synqora cyan and violet, used sparingly.
- Muted text: warm gray, not cold blue-gray.

Avoid the current overly technical cyan-heavy look across every component. Cyan can remain part of the Synqora brand, but green should become the motion/accent color for this redesign.

### Typography

Use large, friendly, high-confidence display typography for hero moments. The typography should feel closer to a product/animation studio than a generic AI agency.

Rules:

- Hero headline should be oversized, tight, and memorable.
- Supporting copy should be plain English and easy to scan.
- Section headings should be shorter and more direct.
- Avoid uppercase labels everywhere; use them only where they help structure the page.
- Keep body text generous enough for mobile readability.

### Shape And Surface

The page should feel less like a dashboard and more like a directed story.

Use:

- Pill buttons and nav items.
- Brace-style or poster-style support copy in the hero.
- Abstract animated shapes in the hero.
- Large content bands instead of many small cards.
- Simpler cards with one job: show a problem and the outcome.

Avoid:

- Too many nested cards.
- Dense metric boxes above the fold.
- Decorative numbering that does not help decision-making.
- Overly technical dashboard previews in the hero.
- Heavy glass effects on every surface.

## Information Architecture

The page should keep the current conversion path, but simplify the visual rhythm.

Recommended order:

1. Hero
2. "Start with one painful task" service chooser
3. Problem/outcome services
4. How Synqora works
5. Example transformations
6. FAQ
7. Contact brief
8. Split poster footer

## Hero Design

### Copy

Primary headline:

> Make AI feel useful.

Supporting copy:

> Learn what AI can do, then build one tool your team actually uses.

CTA:

> Tell us what you need

Secondary link:

> See what we can build

The current wording "Understand AI. Use it at work. Get useful tools built." can remain in metadata or lower-page copy, but the first viewport should be sharper.

### Layout

Desktop:

- Fixed/sticky top navigation with Synqora logo, minimal links, and a pill CTA.
- Full-height hero or near-full-height hero.
- Huge headline taking most of the canvas.
- One animated abstract mark near or inside the headline.
- Brace-style support copy near the lower left.
- CTA placed clearly on the right or below the support copy.
- A hint of the next section should remain visible below the fold.

Mobile:

- Keep headline large but not cropped.
- Use one primary CTA.
- Collapse nav to a simple menu button.
- Abstract shape should stay present but not block text.
- Avoid side-by-side hero image layouts on mobile.

## Motion Design

Use GSAP for a few high-impact moments only.

### Required Animations

1. Hero entrance
   - Headline words animate in with a smooth upward or mask reveal.
   - Supporting copy and CTA follow after the headline.

2. Hero abstract shapes
   - One or two abstract shapes gently rotate, float, or morph.
   - Movement should be slow and intentional.

3. Section reveal
   - Service/problem sections reveal on scroll with staggered movement.
   - Use GSAP ScrollTrigger if added, or GSAP plus IntersectionObserver if keeping dependencies smaller.

4. Footer split reveal
   - The existing split footer idea should animate in more intentionally as it enters the viewport.

### Motion Constraints

- Respect `prefers-reduced-motion`.
- Avoid cursor trails.
- Avoid animating every card continuously.
- Avoid motion that makes reading harder.
- Keep animation performance acceptable on mobile.

## Services Section

The current service section has useful content, but the cards still feel too busy. Redesign this area as "Start with one painful task."

Use plain task-based options:

- Reply to enquiries faster
- Find answers in company files
- Stop copy-paste reports
- Explain AI to the team
- Build a useful website or tool

Each item should show:

- Problem in one sentence.
- What Synqora builds in one sentence.
- Result in one sentence.
- One small action: "Plan this"

Avoid leading with technical category labels like "RAG", "agents", or "automation". These can appear as small supporting text only if needed.

## Method Section

Keep the method simple and trust-building.

Recommended steps:

1. Learn
   - Teach the team what AI can help with and what to avoid.

2. Pick
   - Choose one workflow that is worth improving first.

3. Build
   - Create the assistant, automation, website, or helper.

4. Use
   - Launch with simple instructions and owner training.

This section should look cleaner than the services area. It should feel like a clear process, not another card grid.

## Examples Section

Keep the before/after format because it is easy for non-technical visitors.

Make examples visually larger and simpler:

- WhatsApp leads waiting too long -> AI collects details and drafts replies.
- Team cannot find answers -> private helper answers from trusted files.
- Weekly reports are manual -> workflow gathers data and flags decisions.

Each example should have a clear before/after split and one outcome label.

## Contact Section

Keep the guided brief, but make it feel more like a friendly first step and less like a complex form.

Primary prompt:

> Tell us what work feels slow.

Fields:

- Name
- What work takes too much time?
- Who does this work now?
- What tools do you already use?
- What do you want first?

Quick choices should remain, but they should be visually lighter.

## Components

### New Or Revised Components

- `KineticHero`
  - Owns hero copy, abstract shapes, CTA, and GSAP entrance animation.

- `AnimatedShape`
  - Reusable hero decorative shape with reduced-motion fallback.

- `PainPointChooser`
  - Replaces the current dense stage with clearer task choices.

- `ProblemOutcomeCard`
  - Replaces busier service cards.

- `MethodStrip`
  - Displays Learn, Pick, Build, Use as a clean process.

- `SplitFooter`
  - Keeps current split footer direction but improves animation and spacing.

### Existing Pieces To Keep

- Synqora gradient wordmark.
- Nano-generated visuals, but use fewer of them above the fold.
- Plain-English content direction.
- Contact brief concept.
- FAQ concept.

### Existing Pieces To Remove Or Reduce

- React Bits star-border buttons if they conflict with the GSAP-inspired pill system.
- Excess card glow and spotlight effects.
- Service preview side panel if it makes the section feel too dashboard-like.
- Tutorial cursor animation.

## Implementation Architecture

The app is currently a single `src/App.jsx` plus `src/styles.css`. The redesign should improve maintainability while keeping scope practical.

Recommended structure:

- Keep data arrays in `App.jsx` unless extraction is needed during implementation.
- Create small component functions inside `App.jsx` first.
- Use GSAP inside React `useEffect` hooks with scoped refs.
- Clean up GSAP contexts on unmount.
- Keep CSS in `src/styles.css`, grouped by section.

GSAP usage pattern:

- Import `gsap` from `gsap`.
- Register plugins only if needed.
- Use `gsap.context()` for scoped animations.
- Guard animations with `window.matchMedia("(prefers-reduced-motion: reduce)")`.

## Accessibility

Requirements:

- All primary text must exist as real HTML text, not canvas-only or image-only.
- Hero animation should not prevent reading.
- Buttons must remain keyboard focusable.
- Reduced-motion users should see static but polished layouts.
- Decorative shapes should be `aria-hidden`.
- Form labels must remain accessible.
- Color contrast must remain strong against the dark background.

## Performance

Requirements:

- Avoid heavy continuous animations across the whole page.
- Use transforms and opacity for animation.
- Do not animate layout properties like width, height, top, or left unless necessary.
- Keep image count modest in first viewport.
- Lazy-load lower-page images.
- Verify no horizontal overflow on mobile.

## Testing And Verification

Implementation should be verified with:

- Existing `node tests/validate-site.mjs`.
- `npm run build`.
- Browser screenshot at desktop width.
- Browser screenshot at mobile width.
- Check reduced-motion mode manually or through CSS/JS inspection.
- Confirm no horizontal overflow.
- Confirm GSAP animation cleanup does not throw console errors.

## Success Criteria

The redesign is successful if:

- The first viewport feels memorable and clearly different from a generic AI agency site.
- A non-technical visitor understands what Synqora does within 10 seconds.
- The site feels simpler, not busier.
- Motion feels intentional and premium.
- Cards are fewer, larger, and easier to read.
- The contact path remains obvious.
- Mobile feels designed, not just stacked.


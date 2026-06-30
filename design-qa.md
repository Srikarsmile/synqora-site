update: mobile depth performance trim
viewport: in-app browser mobile viewport, 390x844
state: optimized mobile depth gallery source and mid-scroll check

**Findings**
- No P0/P1/P2 findings remain.

**Patches Made Since Previous QA Pass**
- Rebuilt the mobile portrait depth assets at `720x1280` with smaller file sizes.
- Removed separate per-scroll image transform writes from the mobile ScrollTrigger update.
- Disabled mobile image filter and continuous float animation inside the pinned depth stage.
- Removed the mobile card grid overlay and button backdrop/shadow paint effects.

**Implementation Checklist**
- Static validation passed.
- Mobile browser pass confirmed `720x1280` mobile source selection, no image filter, no image animation, no overlay grid, no button backdrop/shadow, one readable card at mid-scroll, and no readable adjacent card.

final result: passed

---

update: mobile depth overlap cleanup
viewport: in-app browser mobile viewport, 390x844
state: mid-scroll depth gallery around the third card

**Findings**
- No P0/P1/P2 findings remain.

**Patches Made Since Previous QA Pass**
- Hid the large mobile depth intro headline inside the pinned animation stage so it no longer overlays card titles.
- Reduced mobile card title scale and reserved more bottom padding for controls.
- Changed the mobile scroll animation from readable stacked cards to a tighter single-card crossfade with smaller y-motion and rotation.
- Raised the mobile controls so they remain inside the phone viewport.

**Implementation Checklist**
- Static validation passed.
- Mobile browser pass confirmed one readable card at mid-scroll, no readable adjacent card, intro headline hidden, controls below copy, and controls inside the viewport.

final result: passed

---

update: mobile portrait depth assets
viewport: in-app browser mobile viewport, 390x844
state: depth gallery image source selection on phone viewport

**Findings**
- No P0/P1/P2 findings remain.

**Patches Made Since Previous QA Pass**
- Added five `1080x1920` portrait mobile assets under `public/assets/nano/mobile/`.
- Added `mobileImage` paths to each depth gallery item.
- Changed depth gallery card images to responsive `<picture>` markup so mobile loads portrait JPGs and desktop keeps the original landscape WebPs.
- Updated image wrapper CSS so the portrait assets fill the pinned mobile stage without forcing the browser to crop landscape art.

**Implementation Checklist**
- Static validation passed.
- Mobile browser pass confirmed all five depth gallery images selected `/assets/nano/mobile/*.jpg` sources at `390x844`, each with natural size `1080x1920`.

final result: passed

---

update: mobile depth gallery scroll animation
viewport: in-app browser mobile viewport, 390x844
state: pinned depth gallery while scrolling on phone viewport

**Findings**
- No P0/P1/P2 findings remain.

**Patches Made Since Previous QA Pass**
- Added a mobile-only ScrollTrigger path for the depth gallery instead of skipping animation on small screens.
- Converted the mobile gallery into a pinned stage with overlapping cards.
- Animated card opacity, scale, y-position, rotation, image parallax, active state, and progress fill from scroll progress.
- Kept the existing tap controls as shortcuts into the scroll sequence.

**Implementation Checklist**
- Static validation passed.
- Mobile browser pass confirmed the sticky stage pins at the top, progress advances on scroll, and the active card changes from “Train the team” to “Collect better requests.”

final result: passed

---

update: mobile gallery controls and copy cleanup
viewport: in-app browser mobile viewport, 390x844
state: depth gallery phone view after removing reference/ticker copy

**Findings**
- No P0/P1/P2 findings remain.

**Patches Made Since Previous QA Pass**
- Removed the visible interaction reference note and public Codrops/source reference wording.
- Removed the focus-area ticker from the rendered landing-page flow.
- Replaced reused ticker phrases in visible service/contact copy.
- Added mobile depth gallery dot controls and a Next/Services button for explicit touch interaction.

**Implementation Checklist**
- Static validation passed.
- Interrupted-animation hero visibility test passed.
- Production build passed.
- Mobile browser pass confirmed no removed phrases render, no ticker renders, five mobile control groups exist, and tapping Next advances from the first depth card to the second full-screen panel.

final result: passed

---

source visual truth path: `/Users/srikarreddy/.codex/generated_images/019f0dc6-2bd6-7e02-84c6-e4246508bb47/ig_09f0835fd152ab22016a40f90ebb588191814fff2b7857fecd.png`
implementation screenshot path: `/Users/srikarreddy/Downloads/AI Learning/synqora-site/qa/synqora-one-useful-tool-hero-desktop.png`
viewport: 1440x900
state: desktop first viewport after hero entrance animation
full-view comparison evidence: `/Users/srikarreddy/Downloads/AI Learning/synqora-site/qa/one-useful-tool-hero-comparison.png`
focused region comparison evidence: not needed; the hero change is a full-viewport composition and the comparison image shows the relevant typography, nav, CTA, generated transformation visual, and proof strip at readable scale.

**Findings**
- No P0/P1/P2 findings remain.

**Required Fidelity Surfaces**
- Fonts and typography: implementation keeps the approved Synqora display/body system and matches the source hierarchy with a huge warm off-white headline, smaller mono kicker, readable support copy, and compact proof text. The exact generated mock typeface is not cloned, but optical weight and hierarchy are aligned.
- Spacing and layout rhythm: implementation follows the source's two-zone hero composition with headline/actions on the left, transformation visual on the right, and proof strip along the bottom. The rendered visual is slightly more compact than the mock to preserve the existing Synqora nav and responsive grid.
- Colors and visual tokens: near-black background, warm off-white type, acid green CTA, and cyan/violet accent treatment match the selected direction and existing Synqora tokens.
- Image quality and asset fidelity: a generated raster hero asset is used for the before-to-after business task transformation. No placeholder boxes or CSS-only replacement art is used for the primary visual.
- Copy and content: copy follows the selected "One Useful Tool" concept: one slow task becomes one AI tool, with training, first version, handoff, and usable outcome clearly stated.

**Patches Made Since Previous QA Pass**
- Replaced the old audit/workflow-map hero with the "One Useful Tool" hero.
- Added generated hero visual asset at `public/assets/nano/synqora-one-useful-tool-hero.png`.
- Reworked hero GSAP selectors and timeline for route, visual, assistant-message, and proof-strip animation.
- Replaced live-audit CSS with image-based hero visual, assistant overlay, route overlay, and responsive proof strip.
- Updated validation and interrupted-animation visibility tests for the new hero contract.

**Implementation Checklist**
- Static validation passed.
- Interrupted-animation hero visibility test passed.
- Production build passed.
- Desktop and mobile browser screenshots reviewed.

**Follow-up Polish**
- P3: The right-side visual is more compact than the generated mock because it is adapted into the existing Synqora responsive grid. A later pass could widen the right column on very large screens.

final result: passed

---

update: cinematic mobile depth gallery
viewport: in-app browser mobile viewport, 390x844
state: depth gallery mobile scroll after startup scroll reset

**Findings**
- No P0/P1/P2 findings remain.

**Patches Made Since Previous QA Pass**
- Replaced the mobile depth gallery horizontal card scroller with full-screen sticky image panels.
- Hid the long descriptive paragraph on mobile so the section starts with a strong title and immediately moves into visual panels.
- Made each depth step occupy the phone viewport with image drift, gradient overlays, and large bottom copy.
- Reset inherited desktop active-card offsets inside the mobile breakpoint.

**Implementation Checklist**
- Static validation passed.
- Interrupted-animation hero visibility test passed.
- Production build passed.
- Mobile browser pass reviewed the sticky depth panels and fresh console warnings/errors.

final result: passed

---

update: duplicate narrative cleanup
viewport: in-app browser desktop rendered section-order check
state: landing page after adding depth gallery and scroll transition

**Findings**
- No P0/P1/P2 findings remain.

**Patches Made Since Previous QA Pass**
- Removed the older AI audit story section from the rendered landing-page flow.
- Removed the older convert-path lab section from the rendered landing-page flow.
- Updated validation so the page now moves from hero → depth gallery → scroll transition → ticker → services, avoiding repeated “messy workflow becomes AI system” storytelling.

**Implementation Checklist**
- Static validation passed.
- Interrupted-animation hero visibility test passed.
- Production build passed.
- Browser section-order check confirmed `.audit-story-section` and `.convert-path-lab` no longer render.

final result: passed

---

update: mobile immersive section pass
viewport: in-app browser mobile viewport, 390x844
state: depth gallery phone fallback and scroll-transition phone fallback after startup scroll reset

**Findings**
- No P0/P1/P2 findings remain.

**Patches Made Since Previous QA Pass**
- Reworked the mobile depth gallery fallback from stacked cards into a horizontal 3D image carousel.
- Hid the duplicate active depth summary on mobile so the visual panel appears sooner.
- Reset inherited grid placement on mobile depth images so image fills the card.
- Reworked the mobile scroll-transition fallback into clipped, mask-style image panels.

**Implementation Checklist**
- Static validation passed.
- Mobile viewport browser pass reviewed depth image alignment, scroll-snap behavior, transition clip-path animation, and fresh console warnings/errors.

final result: passed

---

update: immersive sections below hero
viewport: in-app browser desktop viewport, 1280x720 rendered screenshot checks
state: depth gallery pinned scroll state and scroll-transition mask state after startup scroll reset

**Findings**
- No P0/P1/P2 findings remain.

**Required Fidelity Surfaces**
- Depth gallery: implemented as a Synqora-specific Three.js scene inspired by `houmahani/codrops-depth-gallery`, using local Synqora service imagery rather than the demo flower assets.
- Scroll transition: implemented as a GSAP ScrollTrigger SVG mask-grid sequence inspired by `Hiro-kiii/Scroll-Transition`, without Lenis or bundled demo scripts.
- Placement: both immersive sections appear immediately after the hero and before the existing ticker/audit/service flow.
- Responsive behavior: mobile and reduced-motion paths expose normal readable cards instead of relying on WebGL or pinned animation.
- Attribution: visible interaction reference note credits Codrops and both source repositories.

**Implementation Checklist**
- Static validation passed.
- Interrupted-animation hero visibility test passed.
- Production build passed.
- Browser visual pass reviewed depth gallery pinning, transition mask state, and fresh console warnings/errors.

final result: passed

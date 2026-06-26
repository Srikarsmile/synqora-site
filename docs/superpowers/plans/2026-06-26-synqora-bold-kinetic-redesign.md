# Synqora Bold Kinetic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the current Synqora homepage with the approved GSAP-inspired bold kinetic redesign.

**Architecture:** Keep the existing Vite/React app and implement the redesign in `src/App.jsx` and `src/styles.css`. Use GSAP through scoped React refs for hero, section reveal, and footer reveal animation, with reduced-motion guards. Update the validation script first so the old design fails and the new design passes.

**Tech Stack:** React 19, Vite 6, GSAP 3, plain CSS, existing local assets.

---

### Task 1: Redesign Validation Contract

**Files:**
- Modify: `tests/validate-site.mjs`

- [x] **Step 1: Add assertions for the new design language**

Add checks that require `KineticHero`, `PainPointChooser`, `ProblemOutcomeCard`, `MethodStrip`, `AnimatedShape`, `gsap.context`, `Make AI feel useful.`, `Start with one painful task.`, `.kinetic-hero`, `.acid-pill`, `.shape-orbit`, `.problem-card`, and `.method-strip`.

- [x] **Step 2: Run validation to verify it fails**

Run: `/Users/srikarreddy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/validate-site.mjs`

Expected: fails on the new GSAP redesign checks.

### Task 2: React Structure And GSAP Hooks

**Files:**
- Modify: `src/App.jsx`

- [x] **Step 1: Replace the old hero and card-heavy structure**

Implement `KineticHero`, `AnimatedShape`, `PainPointChooser`, `ProblemOutcomeCard`, `MethodStrip`, `ExampleTransformations`, `ContactBrief`, and `SplitFooter`. Remove `TutorialCursor`, `ReactBitsBackdrop`, and spotlight/star-border behavior.

- [x] **Step 2: Add scoped GSAP motion**

Import `gsap` from `gsap` and use `gsap.context()` in `App` with a root ref. Animate `.hero-word`, `.hero-support`, `.hero-actions`, `.shape-orbit`, `.reveal-block`, and `.footer-split-char`. Skip animation when `prefers-reduced-motion: reduce` matches.

- [x] **Step 3: Run validation**

Run: `/Users/srikarreddy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/validate-site.mjs`

Expected: remaining failures are CSS-related only.

### Task 3: Visual System CSS

**Files:**
- Modify: `src/styles.css`

- [x] **Step 1: Replace CSS with the bold kinetic design system**

Implement near-black background, warm off-white text, acid green accent, pill navigation, huge hero type, abstract shapes, brace copy, simplified problem cards, method strip, before/after examples, FAQ, brief form, and split footer.

- [x] **Step 2: Add responsive and reduced-motion rules**

Add mobile layout rules, hide secondary hero CTA on small screens, prevent text overflow, disable GSAP-dependent decorative transitions under reduced motion, and ensure no horizontal overflow.

- [x] **Step 3: Run validation**

Run: `/Users/srikarreddy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/validate-site.mjs`

Expected: validation passes.

### Task 4: Verification, Sync, And Push

**Files:**
- Modify: `AGENTS.md`
- Sync: `/Users/srikarreddy/Projects/synqora-site`

- [x] **Step 1: Record durable design decision**

Add a short note to `AGENTS.md` that Synqora should use the bold kinetic GSAP-inspired direction selected by the user.

- [x] **Step 2: Verify locally**

Run:

```bash
/Users/srikarreddy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/validate-site.mjs
PATH="/opt/homebrew/bin:/usr/local/bin:$PATH" npm run build
```

Expected: both pass.

- [x] **Step 3: Browser check**

Use Playwright against `http://127.0.0.1:5173/` and `http://192.168.29.71:5173/` to confirm the new hero text exists and there is no horizontal overflow on desktop or mobile.

- [x] **Step 4: Commit and push**

Commit as `Implement bold kinetic Synqora redesign` and push to `origin/main`.


# GSAP Scale Hero Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Push the Synqora landing page closer to the GSAP homepage direction with a much larger editorial hero and richer motion across the site.

**Architecture:** Keep the existing Vite/React single-page app and update `src/App.jsx`, `src/styles.css`, and `tests/validate-site.mjs`. The hero will become text-first with abstract animated shapes instead of a dashboard-like first viewport. GSAP stays scoped to the app root and respects reduced-motion.

**Tech Stack:** React 19, Vite 6, GSAP 3, plain CSS, existing Synqora assets.

---

### Task 1: Validation Contract

**Files:**
- Modify: `tests/validate-site.mjs`

- [x] **Step 1: Require the GSAP-scale hero markers**

Add assertions for `hero-mega`, `kinetic-spark`, `hero-brace-copy`, `motion-orb`, `section-marquee`, `data-motion-word`, `service-rail-card`, and `gsapScaleHero`.

- [x] **Step 2: Verify the old implementation fails**

Run: `/Users/srikarreddy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/validate-site.mjs`

Expected: validation fails on the new GSAP-scale hero checks.

### Task 2: React Hero And Motion Hooks

**Files:**
- Modify: `src/App.jsx`

- [x] **Step 1: Rework the hero markup**

Replace the current dashboard-first hero with a text-first `hero-mega` layout, large split hero words, brace copy, CTA lane, abstract spark SVG, and floating motion orbs.

- [x] **Step 2: Extend GSAP hooks**

Animate `.hero-word`, `.kinetic-spark`, `.motion-orb`, `.section-marquee span`, `.service-rail-card`, `.method-step`, `.example-card`, and `.contact-brief` with scoped GSAP and reduced-motion guards.

### Task 3: CSS Visual System

**Files:**
- Modify: `src/styles.css`

- [x] **Step 1: Implement the oversized hero**

Add GSAP-inspired huge hero type, abstract gradient shapes, brace copy, bottom CTA alignment, and height-aware fit rules.

- [x] **Step 2: Improve section motion rhythm**

Add section marquee text, roomier service rail cards, stronger reveal surfaces, and responsive rules that avoid overflow.

### Task 4: Verification And Push

**Files:**
- Modify: `AGENTS.md`

- [x] **Step 1: Record the durable direction**

Update `AGENTS.md` to keep the GSAP-scale hero direction.

- [x] **Step 2: Verify**

Run:

```bash
/Users/srikarreddy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/validate-site.mjs
PATH="/opt/homebrew/bin:/usr/local/bin:$PATH" npm run build
```

Use Chrome/Playwright on `http://127.0.0.1:5173/` and `http://192.168.29.71:5173/` to confirm the large hero, no horizontal overflow, desktop cursor behavior, and mobile fit.

- [x] **Step 3: Commit and push**

Commit as `Make Synqora hero more GSAP scale` and push to `origin/main`.

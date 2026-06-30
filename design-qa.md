# Synqora Design QA

Last updated: 2026-06-30

## Current State

- One full-screen gradient/text panel per major section.
- Contact panel uses a static form transform so it does not fade, drift, or flicker while entering the viewport.
- Footer uses a white stage, the people illustration, and a clear `info@synqora.tech` mail link.
- Site pet runtime and generated nano image assets are disabled and removed from the shipped asset tree.
- Local Helvetica Neue files are loaded from `public/fonts/helvetica-neue/`.

## Verification

- `pnpm build`
- `for test in tests/*.mjs; do node "$test" || exit 1; done`
- `git diff --check`

## Cleanup Notes

- Removed old tracked generated image assets from `public/assets/nano/`.
- Removed the unused tracked pet sprite from `public/assets/pet/`.
- Ignored QA screenshots, build output, and local caches stay out of the committed repository.

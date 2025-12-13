## Goal
Make the movie poster stay visible while scrolling down the movie detail page, similar to Letterboxd’s layout (poster in the left column persists while the right column scrolls).

## What Letterboxd is doing (conceptually)
Letterboxd uses a **two-column layout** where the poster column is **`position: sticky`** so it remains pinned within the viewport as you scroll the main content.

## Proposed approach in our codebase
We’ll implement a **sticky poster column** in `apps/web/src/app/movies/[movieId]/page.tsx` using CSS `position: sticky` (Tailwind: `sticky top-*`).

### 1) Add a sticky wrapper around the poster (desktop/tablet only)
- Keep current responsive stacking (`flex-col` on mobile).
- On `md+`, apply sticky behavior to the poster container so it pins while the synopsis/content scrolls.

**Implementation idea (Tailwind classes):**
- Add a wrapper around the poster card:
  - `className="md:sticky md:top-[<offset>] self-start"`
  - Optionally: constrain it so it doesn’t overflow viewport: `md:max-h-[calc(100vh-<offset>)] md:overflow-hidden`

### 2) Ensure sticky works with our layout
Sticky fails if any ancestor has `overflow: hidden/auto/scroll` that clips the sticky element.
- In our page, the backdrop section uses `overflow-hidden`, but the poster is **outside** that section, so it should be fine.
- We’ll confirm no parent wrappers around the poster column have `overflow-*` set.

### 3) Make it configurable (optional but recommended in this repo)
Since this page is already config-driven (`MovieDetailUIConfig`), we’ll add a small config block:
- `poster.sticky.enabled` (boolean)
- `poster.sticky.topOffset` (e.g. `"1.5rem"`)
- Optionally `poster.sticky.onlyOnBreakpoint` (default `md`)

This keeps the behavior adjustable without touching component logic.

### 4) Acceptance criteria
- On `md` and up: poster remains visible (“pinned”) while scrolling the synopsis/content.
- On mobile: layout remains unchanged (poster scrolls normally with content).
- Poster never overlaps the backdrop controls in a weird way (z-index stays as-is).
- No layout shift/jank when switching screenshots/backdrop.

### 5) Edge cases to handle
- Very short pages: sticky should not cause odd spacing.
- Very tall poster or small viewport: poster should not exceed viewport; optional max-height/containment.
- If there is a global header added later: `topOffset` can be increased via config.

## Files to change (once approved)
- `apps/web/src/app/movies/[movieId]/page.tsx` (apply sticky wrapper/classes)
- `apps/web/src/config/movie-detail-ui-config.ts` (add sticky config fields if we go config-driven)
- `docs/features/movie-detail.md` (update feature doc to reflect sticky poster behavior/config)

## Validation plan (after implementation)
- Run repo validators (based on package scripts):
  - `npm run lint` (or equivalent)
  - `npm run typecheck` (if present)
  - `npm test` (if present)

If you want the poster to **stay visible even on mobile**, tell me what behavior you want there (e.g., sticky within viewport vs. shrink-to-mini poster), and I’ll adjust the spec.
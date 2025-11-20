# Proposal: Enhanced Movie Grid Layout with Viewport-Based Scaling

## Why
The current grid implementation has good centering but would benefit from viewport-responsive card sizing. Currently, cards have fixed pixel-based dimensions that don't adapt to screen size changes.

## What Changes Needed
- Cards should scale proportionally with viewport size changes
- Card dimensions only change when browser window resizes, not when movie count changes
- Grid container should remain centered on the page
- Card content should scale with card size changes
- Maintain aspect ratios and text readability at all sizes

## Technical Requirements

### 1. Grid Layout Changes (movies/page.tsx)
- Replace `minmax(150px, 160px)` with `min-width` and `max-width` values like `min-width: 10vw, max-width: 18vw`
- Remove grid-specific padding to prevent offset issues
- Use `grid-template-columns: repeat(auto-fill, min-width, max-width)` for responsive sizing

### 2. Card Sizing (movie-card.tsx)
- Replace fixed pixel dimensions with viewport-based `flex: 1 1; min-width: 10vw-18vw, max-width: 22vw-26vw` etc.)
- Update image container to use percentage-based aspect ratios
- Make text sizing responsive with `calc(clamp(...)) or media queries
- Ensure buttons and metadata scale appropriately

### 3. Content Scaling Strategy
- Implement viewport-relative font sizes using `calc(clamp())` with base sizes
- Scale badge elements and metadata proportionally
- Maintain readability at all card sizes
- Implement icon scaling that grows with card size

### 4. Grid Container Properties
- Keep page container centered with `max-width: 1200px`
- Remove grid padding that was causing left offset
- Maintain left-alignment through flexbox or grid
- Preserve overall centered layout structure

## Expected Behavior
- **Window 640px**: Cards display at ~160px width
- **Window 1280px**: Cards display ~200px width  
- **Window 1920px**: Cards display ~260px width
- **Any screen size change**: Cards maintain their proportional sizing
- **Fewer movies vs many movies**: No size changes across different screen sizes
- **Grid container remains centered** on page across all screen sizes

## Implementation Approach
- Use CSS Grid with viewport-relative column sizing
- Implement responsive breakpoints if needed
- Add CSS calc() for precise sizing controls
- Maintain the existing responsive movie card skeleton and pagination components

## Dependencies
- Keep current Convex integration unchanged
- Maintain search and filter functionality
- Preserve pagination controls and responsive design
- Keep simple HTML components without React Hooks that cause hydration issues

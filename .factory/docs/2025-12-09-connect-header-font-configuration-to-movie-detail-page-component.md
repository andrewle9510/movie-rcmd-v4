## Specification: Connect Header Font Configuration to Movie Detail Page

### Problem
The `MovieDetailUIConfig.headers` configuration exists but is not being applied to the movie title and release year in the movie detail page component. The component currently uses hardcoded Tailwind classes instead of reading from the config.

### Current Implementation (lines 312-315)
```tsx
<h1 className="text-5xl font-bold font-serif tracking-tight text-white drop-shadow-lg mb-2">
  {movie.title}
  {releaseYear && <span className="text-white/80 font-sans font-normal ml-3 text-4xl">({releaseYear})</span>}
</h1>
```

### Solution
Update the movie detail page component to apply the header font configuration using inline styles:

1. **Extract config values** from `MovieDetailUIConfig.headers.title` and `MovieDetailUIConfig.headers.releaseYear`

2. **Apply to title element**:
   - Font family, size, weight, color, line height, letter spacing from `headers.title`
   
3. **Apply to release year span**:
   - Font family, size, weight, color, line height, letter spacing from `headers.releaseYear`

4. **Use inline styles** to apply configuration values (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing)

5. **Keep Tailwind classes** for layout properties (mb-2, ml-3, drop-shadow-lg) that aren't in the config

### Implementation Details
- File: `/Users/andrewle/Documents/Workspace/movie-rcmd-v4/apps/web/src/app/movies/[movieId]/page.tsx`
- Update the `<h1>` and `<span>` elements around line 312-315
- Apply config values as inline styles combined with remaining Tailwind classes
- Maintain existing functionality (drop-shadow, margins, etc.)
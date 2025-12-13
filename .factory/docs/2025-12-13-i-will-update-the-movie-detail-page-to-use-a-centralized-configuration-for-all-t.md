I will update the movie detail page to use a centralized configuration for all typography elements, ensuring consistent and improved styling.

### 1. Update `apps/web/src/config/movie-detail-ui-config.ts`

I will expand the configuration to include `tagline` and `description` styles, and refine the `headers` styles for a more cinematic look.

```typescript
export const MovieDetailUIConfig = {
  // ... existing layout/backdrop/poster/carousel config ...

  // Header typography configuration
  headers: {
    title: {
      fontFamily: "Montserrat",
      fontSize: "3rem", // Increased from 2rem for impact
      fontWeight: "800", // Bolder
      color: "text-white",
      lineHeight: "1.1",
      letterSpacing: "-0.02em",
    },
    releaseYear: {
      fontFamily: "Inter",
      fontSize: "1.25rem",
      fontWeight: "500", // Slightly heavier
      color: "text-gray-300",
      lineHeight: "1.4",
      letterSpacing: "0.02em",
    },
    duration: {
      fontFamily: "Inter",
      fontSize: "1.25rem",
      fontWeight: "500",
      color: "text-gray-400",
      lineHeight: "1.4",
      letterSpacing: "0.02em",
    },
  },

  // NEW: Tagline configuration
  tagline: {
    fontFamily: "Montserrat", // Matches title font
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "text-gray-200",
    lineHeight: "1.4",
    fontStyle: "italic",
    marginBottom: "2rem",
  },

  // NEW: Description configuration
  description: {
    fontFamily: "Inter", // Clean sans-serif for reading
    fontSize: "1.125rem", // 18px
    fontWeight: "400",
    color: "text-gray-100",
    lineHeight: "1.8", // Loose leading for readability
    maxWidth: "65ch", // Optimal reading width
  },
} as const;
```

### 2. Refactor `apps/web/src/app/movies/[movieId]/page.tsx`

I will update the component to use these new configuration values and remove the hardcoded blockquote styling.

**Changes:**
- **Title/Year/Duration**: Will use the updated `headers` config.
- **Tagline**:
  - Remove `border-l-4 border-primary/40 pl-4` (blockquote style).
  - Remove `font-serif`.
  - Apply new config styles (`fontFamily`, `fontSize`, `color`, etc.).
- **Description**:
  - Remove `font-serif`.
  - Apply new config styles (`fontFamily`, `fontSize`, `lineHeight`, `maxWidth`).

**Code Preview:**

```tsx
{/* TAGLINE */}
{movie.tagline && (
  <p
    className={`mb-4 ${MovieDetailUIConfig.tagline.color} ${MovieDetailUIConfig.tagline.fontStyle === 'italic' ? 'italic' : ''}`}
    style={{
      fontFamily: MovieDetailUIConfig.tagline.fontFamily,
      fontSize: MovieDetailUIConfig.tagline.fontSize,
      fontWeight: MovieDetailUIConfig.tagline.fontWeight,
      lineHeight: MovieDetailUIConfig.tagline.lineHeight,
      marginBottom: MovieDetailUIConfig.tagline.marginBottom,
    }}
  >
    &ldquo;{movie.tagline}&rdquo;
  </p>
)}

{/* SYNOPSIS SECTION */}
<div className="mb-12">
  <p
    className={`${MovieDetailUIConfig.description.color}`}
    style={{
      fontFamily: MovieDetailUIConfig.description.fontFamily,
      fontSize: MovieDetailUIConfig.description.fontSize,
      fontWeight: MovieDetailUIConfig.description.fontWeight,
      lineHeight: MovieDetailUIConfig.description.lineHeight,
      maxWidth: MovieDetailUIConfig.description.maxWidth,
    }}
  >
    {movie.description}
  </p>
</div>
```
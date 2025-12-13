I understand. I will permanently remove all quote mark logic and make the font style fully configurable via an Enum.

### 1. Update `apps/web/src/config/movie-detail-ui-config.ts`

I will add the `FontStyle` Enum and update the tagline config to use it, replacing the hardcoded "italic" string. I will **not** add any quote-related configuration.

```typescript
export enum FontStyle {
  Normal = "normal",
  Italic = "italic",
}

export const MovieDetailUIConfig = {
  // ...
  tagline: {
    // ...
    fontStyle: FontStyle.Italic, // Fully typed Enum control
    // No decorators object
  },
  // ...
}
```

### 2. Update `apps/web/src/app/movies/[movieId]/page.tsx`

I will remove the hardcoded `&ldquo;` and `&rdquo;` entities completely. I will also remove the ternary logic that was checking for "italic" string and replace it with direct style application.

```tsx
{/* TAGLINE */}
{movie.tagline && (
  <p
    // ...
    style={{
      // ...
      fontStyle: MovieDetailUIConfig.tagline.fontStyle, // Direct mapping
    }}
  >
    {movie.tagline} {/* Just the tagline, clean. */}
  </p>
)}
```

This cleans up the code and gives you exactly what you asked for: no quotes, just configurable text.
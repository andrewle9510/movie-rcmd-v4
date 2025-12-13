## Changes Overview

I'll add movie duration display to the headers section with configurable typography, similar to how title and releaseYear are currently styled.

### 1. Update `movie-detail-ui-config.ts`
Add a new `duration` configuration to the `headers` section:

```typescript
headers: {
  title: { ... },
  releaseYear: { ... },
  duration: {
    fontFamily: "Inter",
    fontSize: "1.25rem",
    fontWeight: "500",
    color: "text-gray-400",
    lineHeight: "1.4",
    letterSpacing: "",
  },
}
```

### 2. Update `page.tsx`
**Remove** the current metadata row display (lines 373-379):
```tsx
{/* METADATA ROW */}
<div className="flex flex-wrap items-center gap-3 mt-4 mb-8 ...">
  {movie.duration && (
    <>
      {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
    </>
  )}
</div>
```

**Add** duration to the header section (after the releaseYear span, within the `<h1>` tag):
```tsx
<h1 ...>
  {movie.title}
  {releaseYear && <span ...>({releaseYear})</span>}
  {movie.duration && (
    <span 
      className={`ml-3 ${MovieDetailUIConfig.headers.duration.color}`}
      style={{
        fontFamily: MovieDetailUIConfig.headers.duration.fontFamily,
        fontSize: MovieDetailUIConfig.headers.duration.fontSize,
        fontWeight: MovieDetailUIConfig.headers.duration.fontWeight,
        lineHeight: MovieDetailUIConfig.headers.duration.lineHeight,
        letterSpacing: MovieDetailUIConfig.headers.duration.letterSpacing,
      }}
    >
      • {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
    </span>
  )}
</h1>
```

This will display as: **Movie Title (2024) • 2h 15m** in the header with configurable styling.
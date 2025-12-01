# Movie Detail Feature

Movie detail page displays comprehensive movie information including backdrop images, poster, synopsis, ratings, cast, and genres.

## File Inventory

### Core Components:
- `apps/web/src/features/movie-detail/hooks/use-movie-detail.ts` - Hook for fetching individual movie details by ID or TMDB ID

### Utilities:
- `apps/web/src/features/movie-detail/utils/movie-detail-ui-config.ts` - UI configuration for detail page layout, backdrop height, gradient effects
- `apps/web/src/features/movie-detail/utils/movie-detail-backdrop-poster-config.ts` - Per-movie image path overrides for TMDB posters/backdrops

## Functioning Purpose

- **useMovieDetail Hook**: Fetches single movie by Convex ID or TMDB ID, checks cache first for performance, uses ref to prevent unnecessary re-renders
- **MovieDetailUIConfig**: Configuration for backdrop height, opacity, transitions, gradient fade, carousel controls styling, poster dimensions, layout gaps
- **MovieDetailImageConfig**: Maps TMDB movie IDs to custom poster/backdrop file paths for enhanced image quality or manual overrides

## Interaction

1. **Page Flow**: User navigates to `/movies/[movieId]` → route extracts ID from URL → `useMovieDetail` hook fetches movie from cache or API
2. **Rendering**: 
   - Top section: Large cinematic backdrop with image carousel (if multiple screenshots available)
   - Middle: Poster image + metadata (title, year, genres, duration)
   - Bottom: Synopsis, ratings, release date, stats grid
3. **Image Carousel**: Left/right controls navigate through backdrop + screenshot list (uses BackdropCarouselControls from movie-browsing)
4. **Caching**: Results cached via MoviesProvider in shared layer for instant navigation

## Dependencies

- **movie-browsing**: Uses BackdropCarouselControls component and movie-utils for data transformation
- **shared**: Uses Movie type and MoviesProvider for cached data
- **Convex**: Queries api.movies.getMovie and api.movies.getMovieByTmdbId

## Configuration

Adjust appearance by modifying `movie-detail-ui-config.ts`:
- `layout.backdropHeight`: Height of backdrop image section (default: "400px")
- `layout.contentNegativeMargin`: Overlap poster with backdrop (default: "-120px")
- `poster.width`: Fixed poster width (default: "280px")
- `poster.aspectRatio`: Poster dimensions (default: "2/3")
- `backdrop.opacity`: Image opacity (default: 0.95)
- `backdrop.screenshotTransitionDuration`: Fade duration between images (default: "0.4s")
- `carouselControls`: Size, color, position of navigation buttons

Override images in `movie-detail-backdrop-poster-config.ts`:
```typescript
[TMDB_ID]: {
  posterFilepath: "/path/to/poster.jpg",
  backdropFilepath: "/path/to/backdrop.jpg"
}
```

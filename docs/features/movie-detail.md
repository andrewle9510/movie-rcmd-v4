# Movie Detail Feature

Movie detail page displays comprehensive movie information including backdrop images, poster, synopsis, ratings, cast, directors, and genres.

## File Inventory

### Core Hooks:
- `apps/web/src/features/movie-detail/hooks/use-movie-detail.ts` - Hook for fetching individual movie details by ID or TMDB ID, including crew data for directors

### Utilities:
- `apps/web/src/features/movie-detail/utils/movie-detail-ui-config.ts` - UI configuration for detail page layout, backdrop height, gradient effects
- `apps/web/src/features/movie-detail/utils/movie-detail-backdrop-poster-config.ts` - Per-movie image path overrides for TMDB posters/backdrops
- `apps/web/src/features/movie-browsing/utils/movie-utils.ts` - Data transformation function that maps director IDs to names using crew data

## Functioning Purpose

- **useMovieDetail Hook**: Fetches single movie by Convex ID or TMDB ID, checks cache first for performance, fetches crew data for director names, uses ref to prevent unnecessary re-renders
- **transformMovieData**: Accepts raw movie object and crew data, maps director IDs to director names (filtered by crew_type='Director'), returns typed Movie object
- **MovieDetailUIConfig**: Configuration for backdrop height, opacity, transitions, gradient fade, carousel controls styling, poster dimensions, layout gaps, and poster position
- **MovieDetailImageConfig**: Maps TMDB movie IDs to custom poster/backdrop file paths for enhanced image quality or manual overrides

## Interaction

1. **Page Flow**: User navigates to `/movies/[movieId]` → route extracts ID from URL → `useMovieDetail` hook:
   - Fetches movie from cache or API
   - Extracts director IDs from movie.directors
   - Calls `getCrewByIds` Convex query to fetch crew names
   - Passes movie + crew data to `transformMovieData` for name mapping
   
2. **Director Resolution**: 
   - Raw movie has `directors: number[]` (TMDB IDs)
   - Hook fetches crew records where crew_id matches directors array
   - transformMovieData filters crew by crew_type='Director' and maps IDs to names
   - Returns `directorNames: string[]` in Movie object
   
3. **Rendering**: 
   - Top section: Large cinematic backdrop with image carousel (if multiple screenshots available)
   - Middle: Poster image + metadata (title, year, duration)
   - Directors line: "Directed by [director names]" (from directorNames array)
   - Tagline section
   - Bottom: Synopsis, ratings, release date, stats grid
   
4. **Image Carousel**: Left/right controls navigate through backdrop + screenshot list (uses BackdropCarouselControls from movie-browsing)

5. **Poster Position**: Controlled by `MovieDetailUIConfig.poster.position` setting ('left' or 'right'). Flex layout uses `md:flex-row-reverse` for right position or `md:flex-row` for left position

6. **Caching**: Movie data cached via MoviesProvider in shared layer for instant navigation

## Dependencies

- **movie-browsing**: Uses BackdropCarouselControls component and movie-utils for data transformation
- **shared**: Uses Movie type and MoviesProvider for cached data
- **Convex**: Queries:
  - `api.movies.getMovie` - Fetch movie by Convex ID
  - `api.movies.getMovieByTmdbId` - Fetch movie by TMDB ID
  - `api.movies.getCrewByIds` - Fetch crew names for given crew IDs

## Configuration

Adjust appearance by modifying `movie-detail-ui-config.ts`:

### Layout & Poster
- `layout.backdropHeight`: Height of backdrop image section (default: "500px")
- `layout.contentNegativeMargin`: Overlap poster with backdrop (default: "-2rem")
- `poster.width`: Fixed poster width (default: "250px")
- `poster.aspectRatio`: Poster dimensions (default: "2/3")
- `poster.position`: Poster position toggle - set to "left" or "right" (default: "right")

### Backdrop & Effects
- `backdrop.opacity`: Image opacity (default: "1")
- `backdrop.loadingOpacity`: Opacity while loading (default: 0.5)
- `backdrop.screenshotTransitionDuration`: Fade duration between images (default: "0.8s")
- `backdrop.bottomFade`: Gradient fade configuration (enabled, height, intensity)

### Carousel Controls
- `carouselControls`: Size, color, position of navigation buttons

Override images in `movie-detail-backdrop-poster-config.ts`:
```typescript
[TMDB_ID]: {
  posterFilepath: "/path/to/poster.jpg",
  backdropFilepath: "/path/to/backdrop.jpg"
}
```

## Crew Table Integration

Directors are stored and retrieved via the `crew` table in Convex:

**Table Structure:**
- `crew_id: number` - TMDB person ID (primary identifier)
- `crew_name: string` - Person's full name
- `crew_type: string` - Job type ("Director", "Producer", "Writer", etc.)

**Data Population:**
- During TMDB movie import, all crew members are extracted from TMDB API
- `insertNewCrew` function checks if crew_id exists in crew table
- Only new crew members are inserted (prevents duplicates)
- Existing crew records are reused across movies

**Name Resolution Flow:**
```
movie.directors (ID array)
    ↓
useMovieDetail fetches crew via getCrewByIds
    ↓
transformMovieData maps IDs → names (filters by crew_type='Director')
    ↓
movie.directorNames (string array)
```

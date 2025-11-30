# Movie Detail Feature

## File Inventory

### Core Files:
- `apps/web/src/app/movies/[movieId]/page.tsx` - Dynamic page component for displaying individual movie details with cinematic layout
- `apps/web/src/config/movie-detail-ui-config.ts` - Centralized configuration for movie detail page UI layout, backdrop, and poster positioning
- `apps/web/src/config/movie-detail-backdrop-poster-config.ts` - Manual configuration for overriding default poster/backdrop images with specific TMDB filepaths
- `apps/web/src/hooks/use-movie-detail.ts` - Custom hook for fetching and managing individual movie data with loading states. Supports both Convex ID and TMDB ID lookups.
- `apps/web/src/lib/movie-utils.ts` - Utility functions for movie detail data processing including formatting and transformations

### Supporting Files:
- `apps/web/src/types/movie.ts` - TypeScript type definitions for movie detail entities ensuring type safety
- `apps/web/src/app/movies/layout.tsx` - Layout wrapper for the movie detail page providing consistent structure

## Functioning Purpose

- **`movies/[movieId]/page.tsx`**: The dynamic page component that renders detailed information about a specific movie in a cinematic layout. Accepts movieId from URL (can be Convex ID or TMDB ID). Uses `useMovie()` hook to fetch movie data. Renders hero backdrop section at configurable height with optional bottom gradient fade. Main content area overlaps backdrop via negative margin. Dynamically determines poster positioning (left/right) based on `MovieDetailUIConfig.poster.position`. Checks `MovieDetailImageConfig` for manual poster/backdrop filepath overrides by TMDB ID. Displays title, year, duration, genres, tagline, synopsis, rating, and release date in structured format with Tailwind styling.

- **`movie-detail-ui-config.ts`**: Centralized configuration object defining visual constants: backdrop height (500px), content negative margin (-2rem for overlap effect), section gap (2.5rem), poster width (250px), poster aspect ratio (2/3), backdrop opacity (0-1), and bottom fade gradient (enabled/disabled, height, intensity: soft/medium/hard). All values are easily tweakable without modifying component code.

- **`movie-detail-backdrop-poster-config.ts`**: Configuration object mapping TMDB IDs to image override objects. For specific movies, you can define custom `posterFilepath` and/or `backdropFilepath` as TMDB filepaths. When configured, these override the default main_poster/main_backdrop from the database. Allows precise control over which images display for specific movies, useful for fixing poor defaults or curating specific versions.

- **`use-movie-detail.ts`**: Custom hook that fetches individual movie data. Detects if movieId parameter is numeric (TMDB ID) or alphanumeric (Convex ID). Queries Convex API with appropriate query (`getMovie` for Convex ID, `getMovieByTmdbId` for TMDB ID). Returns movie object (transformed via `transformMovieData()`), isLoading state, and error message. Handles both query types transparently.

- **`movie-utils.ts`**: Transforms raw Convex movie documents to frontend Movie interface. Constructs TMDB image URLs from filepaths: poster images use w500 width for smaller file size, backdrop images use original dimensions for quality. Handles missing data gracefully. Maps database field names (tmdb_id, main_poster, main_backdrop, release_date, vote_pts_system, runtime_minutes, etc.) to frontend interface.

- **`movie.ts`**: Defines Movie interface with fields: _id (string), title, description, posterUrl, backdropUrl, tagline, releaseDate, genres (array), rating (number), duration (minutes), director, cast (array), tmdbId (number). Ensures type safety for all movie data.

- **`movies/layout.tsx`**: Provides consistent layout structure for the movie detail page via MoviesProvider, maintaining UI consistency with the browsing experience.

## Interaction

The movie detail feature creates a comprehensive cinematic view of individual movies through interconnected components:

1. **Navigation**: When a user clicks on a movie card from the browsing page, the app routes to `movies/[movieId]/page.tsx` with the specific movie ID (either Convex ID or TMDB ID).

2. **Movie Fetching**: The page component calls `useMovie(movieId)` hook. The hook detects ID type (numeric = TMDB ID, alphanumeric = Convex ID) and queries the appropriate Convex function.

3. **Dual Query Support**: Hook uses conditional Convex queries: `api.movies.getMovie` for Convex IDs, `api.movies.getMovieByTmdbId` for TMDB IDs. Returns loading state during fetch.

4. **Data Transformation**: Once fetched, movie data is transformed via `transformMovieData()` which builds TMDB image URLs from filepaths (w500 for posters, original for backdrops).

5. **Image Override Check**: Page checks `MovieDetailImageConfig` by TMDB ID. If a movie has a configured override, those custom filepaths replace the default poster/backdrop URLs before rendering.

6. **Backdrop Rendering**: Hero backdrop section renders using configured height (500px by default). Image has configurable opacity. Bottom gradient fade is applied if enabled, with intensity (soft/medium/hard) mapped to CSS classes.

7. **Layout Direction**: `flexDirection` is dynamically set based on `MovieDetailUIConfig.poster.position` ('left' = flex-row, 'right' = flex-row-reverse), allowing quick poster repositioning via config.

8. **Content Overlap Effect**: Negative margin pulls the content section up over the backdrop (default -2rem). Poster and details are positioned side-by-side with configurable gap spacing.

9. **Information Display**: Page displays title, release year in serif font with drop-shadow, duration and genres in styled tags, tagline in italic with left border accent, synopsis paragraph, and stats grid with rating and release date.

10. **Responsive Behavior**: Flexbox layout stacks on small screens (flex-col) and uses flex-row or flex-row-reverse on medium screens (md:) based on poster.position config.

11. **Type Safety**: All data flowing through the component is validated by Movie interface, ensuring consistency across data transformation and rendering.

12. **Consistent Navigation**: Shared `movies/layout.tsx` wraps both detail and browsing pages, ensuring MoviesProvider context is available and UI remains consistent.

This architecture creates an immersive, cinematic movie detail experience with efficient data fetching from dual query types, flexible visual presentation via config, and precise image curation via overrides. The centralized configuration approach eliminates the need to modify component code for layout or styling changes, and manual image overrides provide precise control over visual presentation for specific movies.

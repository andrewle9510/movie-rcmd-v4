# Movie Detail Feature

## File Inventory

### Core Files:
- `apps/web/src/app/movies/[movieId]/page.tsx` - Dynamic page component for displaying individual movie details with cinematic layout. Manages screenshot carousel state and navigation.
- `apps/web/src/config/movie-detail-ui-config.ts` - Centralized configuration for movie detail page UI layout, backdrop, poster positioning, and carousel controls styling
- `apps/web/src/config/movie-detail-backdrop-poster-config.ts` - Manual configuration for overriding default poster/backdrop images with specific TMDB filepaths
- `apps/web/src/hooks/use-movie-detail.ts` - Custom hook for fetching and managing individual movie data with loading states. Supports both Convex ID and TMDB ID lookups.
- `apps/web/src/lib/movie-utils.ts` - Utility functions for movie detail data processing including formatting and transformations

### Component Files:
- `apps/web/src/components/backdrop-carousel-controls.tsx` - Carousel navigation buttons (left/right) for screenshot navigation. Positioned at bottom-left and bottom-right of backdrop.

### Supporting Files:
- `apps/web/src/types/movie.ts` - TypeScript type definitions for movie detail entities ensuring type safety. Includes screenshot data fields.
- `apps/web/src/app/movies/layout.tsx` - Layout wrapper for the movie detail page providing consistent structure

## Functioning Purpose

- **`movies/[movieId]/page.tsx`**: The dynamic page component that renders detailed information about a specific movie in a cinematic layout. Accepts movieId from URL (can be Convex ID or TMDB ID). Uses `useMovie()` hook to fetch movie data. Manages screenshot carousel state (`currentScreenshotIndex`) for navigating through available screenshots. Renders hero backdrop section using screenshots (if available) or regular backdrop at configurable height with optional bottom gradient fade. Implements screenshot carousel logic: builds screenshot URLs from template by replacing `{screenshot_id}` with current index, handles next/previous navigation with wrap-around, resets index when movie changes. Supports keyboard navigation (arrow left/right). Main content area overlaps backdrop via negative margin. Dynamically determines poster positioning (left/right) based on `MovieDetailUIConfig.poster.position`. Checks `MovieDetailImageConfig` for manual poster/backdrop filepath overrides by TMDB ID (only when no screenshots). Displays title, year, duration, genres, tagline, synopsis, rating, and release date in structured format with Tailwind styling.

- **`movie-detail-ui-config.ts`**: Centralized configuration object defining visual constants: backdrop height (500px), content negative margin (-2rem for overlap effect), section gap (2.5rem), poster width (250px), poster aspect ratio (2/3), backdrop opacity (0-1), bottom fade gradient (enabled/disabled, height, intensity: soft/medium/hard), and carousel controls (icon size, padding, background colors, positioning). All values are easily tweakable without modifying component code.

- **`movie-detail-backdrop-poster-config.ts`**: Configuration object mapping TMDB IDs to image override objects. For specific movies, you can define custom `posterFilepath` and/or `backdropFilepath` as TMDB filepaths. When configured, these override the default main_poster/main_backdrop from the database. Allows precise control over which images display for specific movies, useful for fixing poor defaults or curating specific versions.

- **`use-movie-detail.ts`**: Custom hook that fetches individual movie data. Detects if movieId parameter is numeric (TMDB ID) or alphanumeric (Convex ID). Queries Convex API with appropriate query (`getMovie` for Convex ID, `getMovieByTmdbId` for TMDB ID). Returns movie object (transformed via `transformMovieData()`), isLoading state, and error message. Handles both query types transparently.

- **`movie-utils.ts`**: Transforms raw Convex movie documents to frontend Movie interface. Constructs TMDB image URLs from filepaths: poster images use w500 width for smaller file size, backdrop images use original dimensions for quality. Exposes screenshot data fields (`screenshot_url` template and `screenshot_id_list`). Handles missing data gracefully. Maps database field names (tmdb_id, main_poster, main_backdrop, release_date, vote_pts_system, runtime_minutes, screenshot_url, screenshot_id_list, etc.) to frontend interface.

- **`movie.ts`**: Defines Movie interface with fields: _id (string), title, description, posterUrl, backdropUrl, tagline, releaseDate, genres (array), rating (number), duration (minutes), director, cast (array), tmdbId (number), screenshotUrl (template string with `{screenshot_id}` placeholder), screenshotIdList (array of screenshot IDs). Ensures type safety for all movie data.

- **`BackdropCarouselControls.tsx`**: Reusable carousel navigation component rendering left/right arrow buttons (ChevronLeft/ChevronRight icons from lucide-react). Positioned absolutely at bottom-left and bottom-right of parent container. Only renders when `show` prop is true (i.e., when screenshots are available). Styled using `MovieDetailUIConfig.carouselControls` for transparent background (bg-black/30), hover effects, and positioning. Supports ARIA labels and title tooltips showing current/total count.

- **`movies/layout.tsx`**: Provides consistent layout structure for the movie detail page via MoviesProvider, maintaining UI consistency with the browsing experience.

## Interaction

The movie detail feature creates a comprehensive cinematic view of individual movies through interconnected components:

1. **Navigation**: When a user clicks on a movie card from the browsing page, the app routes to `movies/[movieId]/page.tsx` with the specific movie ID (either Convex ID or TMDB ID).

2. **Movie Fetching**: The page component calls `useMovie(movieId)` hook. The hook detects ID type (numeric = TMDB ID, alphanumeric = Convex ID) and queries the appropriate Convex function.

3. **Dual Query Support**: Hook uses conditional Convex queries: `api.movies.getMovie` for Convex IDs, `api.movies.getMovieByTmdbId` for TMDB IDs. Returns loading state during fetch.

4. **Data Transformation**: Once fetched, movie data is transformed via `transformMovieData()` which builds TMDB image URLs from filepaths (w500 for posters, original for backdrops) and exposes screenshot data (`screenshotUrl` template and `screenshotIdList` array).

5. **Screenshot Carousel Initialization**: Page initializes `currentScreenshotIndex` state to 0. On movie change (movieId dependency), index resets to 0. Carousel logic checks if `screenshotIdList` exists and has items to determine `hasScreenshots`.

6. **Image Override Check**: Page checks `MovieDetailImageConfig` by TMDB ID. If a movie has a configured override and no screenshots are available, those custom filepaths replace the default poster/backdrop URLs before rendering.

7. **Screenshot URL Building**: For carousel images, `buildScreenshotUrl()` function replaces `{screenshot_id}` placeholder in `screenshotUrl` template with the current screenshot ID from `screenshotIdList[currentScreenshotIndex]`. Screenshots replace the backdrop image entirely when available.

8. **Backdrop Rendering**: Hero backdrop section renders using configured height (500px by default) and displays either the current screenshot or fallback backdrop image. Image has configurable opacity. Bottom gradient fade is applied if enabled, with intensity (soft/medium/hard) mapped to CSS classes.

9. **Carousel Controls Rendering**: `BackdropCarouselControls` component renders conditionally (only when `hasScreenshots` is true). Shows left/right navigation buttons positioned at bottom-left and bottom-right. Buttons pass current index and total count for display in tooltips.

10. **Navigation Interaction**: User can navigate screenshots via:
    - **Mouse Click**: Click left/right buttons to move to previous/next screenshot
    - **Keyboard**: Press ArrowLeft/ArrowRight keys to navigate
    - **Wrap-Around**: Navigation wraps around (last screenshot → first, first → last) using modulo arithmetic

11. **Layout Direction**: `flexDirection` is dynamically set based on `MovieDetailUIConfig.poster.position` ('left' = flex-row, 'right' = flex-row-reverse), allowing quick poster repositioning via config.

12. **Content Overlap Effect**: Negative margin pulls the content section up over the backdrop (default -2rem). Poster and details are positioned side-by-side with configurable gap spacing.

13. **Information Display**: Page displays title, release year in serif font with drop-shadow, duration and genres in styled tags, tagline in italic with left border accent, synopsis paragraph, and stats grid with rating and release date.

14. **Responsive Behavior**: Flexbox layout stacks on small screens (flex-col) and uses flex-row or flex-row-reverse on medium screens (md:) based on poster.position config.

15. **Type Safety**: All data flowing through the component is validated by Movie interface, ensuring consistency across data transformation and rendering.

16. **Consistent Navigation**: Shared `movies/layout.tsx` wraps both detail and browsing pages, ensuring MoviesProvider context is available and UI remains consistent.

This architecture creates an immersive, cinematic movie detail experience with efficient data fetching from dual query types, flexible visual presentation via config, interactive screenshot carousel for visual exploration, and precise image curation via overrides. The centralized configuration approach eliminates the need to modify component code for layout or styling changes, and manual image overrides provide precise control over visual presentation for specific movies. The screenshot carousel with keyboard and mouse support enhances user engagement without complicating the interface.

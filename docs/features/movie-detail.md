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

- **`movies/[movieId]/page.tsx`**: Dynamic page component rendering detailed information about a specific movie in cinematic layout. Accepts movieId from URL (Convex ID or TMDB ID). Uses `useMovie()` hook to fetch movie data via appropriate Convex query. Manages screenshot carousel state with `currentScreenshotIndex` (0 = main backdrop, 1-10 = screenshots). Builds screenshot URLs by replacing `{screenshot_id}` placeholder in screenshotUrl template with current ID from screenshotIdList. Implements carousel logic: next/previous navigation with wrap-around modulo arithmetic. Preloads adjacent images for smooth transitions. Supports keyboard navigation (ArrowLeft/ArrowRight). Cross-fade animation between images using opacity transitions. Renders hero backdrop section at configurable height with optional bottom gradient fade. Applies flex layout with flex-row or flex-row-reverse based on poster.position config. Main content overlaps backdrop via negative margin. Checks MovieDetailImageConfig for manual poster/backdrop filepath overrides by TMDB ID. Displays title with release year, duration and genre tags, tagline with left border accent, synopsis paragraph, and stats grid with rating and formatted release date.

- **`movie-detail-ui-config.ts`**: Centralized configuration object defining visual constants: layout (backdrop height 500px, content negative margin -2rem overlap, gap 2.5rem between sections), backdrop (opacity 0-1, loadingOpacity 0.5, transition durations for loading and screenshot switching, bottom fade settings with intensity soft/medium/hard), poster (width 250px, position left/right, aspect ratio 2/3), carousel controls (icon size, padding, background colors for idle/hover, positioning from bottom/sides), and comprehensive typography settings for headers (title, release year, duration), tagline, and description. All values tweakable without component code modifications.

  - **Sticky poster (Letterboxd-style)**: `MovieDetailUIConfig.poster.sticky` controls whether the poster column stays visible while scrolling on `md+` screens. It uses CSS `position: sticky` with a configurable `topOffset`.

  - **Debug mock scroll content (temporary)**: `MovieDetailUIConfig.debug.mockLongContent` can add extra text-only paragraphs to force scrolling, useful to verify the sticky poster behavior during development.

- **`movie-detail-backdrop-poster-config.ts`**: Configuration object mapping TMDB IDs to image override objects. For specific movies, define custom `posterFilepath` and/or `backdropFilepath` as TMDB filepaths. Overrides default main_poster/main_backdrop from database. Only applied when no screenshots available. Enables precise control over visual presentation for specific movies.

- **`use-movie-detail.ts`**: Hook fetching individual movie data with dual query support. Detects movieId type: numeric = TMDB ID, alphanumeric = Convex ID. First checks MoviesProvider cache via useMoviesContext. If found in cache, returns immediately without Convex query (performance optimization). If not cached, queries Convex: `api.movies.getMovie` for Convex ID or `api.movies.getMovieByTmdbId` for TMDB ID. Uses useRef to maintain stable cached result across re-renders. Returns transformed movie via `transformMovieData()`, isLoading state, and error message.

- **`movie-utils.ts`**: Transforms raw Convex documents to frontend Movie interface. Constructs TMDB image URLs: w500 width for posters (smaller file size), original dimensions for backdrops (quality). Extracts screenshot data fields (screenshotUrl template and screenshotIdList). Handles missing data gracefully. Maps database field names (tmdb_id → tmdbId, main_poster → posterUrl, main_backdrop → backdropUrl, release_date → releaseDate, vote_pts_system.tmdb → rating, runtime_minutes → duration, etc.) to frontend interface.

- **`movie.ts`**: Defines Movie interface used by the movie detail page. In addition to display fields (title, release year, duration, images, etc.), it exposes `directorIds` (TMDB person IDs) so the UI can render a “Directed by …” line by looking up names in the `people` table.

- **`BackdropCarouselControls.tsx`**: Carousel navigation component rendering left/right ChevronLeft/ChevronRight buttons. Positioned absolutely at bottom-left and bottom-right of backdrop. Conditionally renders based on `show` prop (true when screenshots or backdrop available). Styled using MovieDetailUIConfig.carouselControls (bg-black/40 idle, bg-white/40 hover, text-white icons). Displays current/total count in tooltip (e.g., "2/11").

- **`movies/layout.tsx`**: Layout wrapper applying MoviesProvider context to movie detail pages. Includes Footer component. Maintains UI consistency with browsing experience.

## Interaction

The movie detail feature creates a comprehensive cinematic view of individual movies through interconnected components:

1. **Navigation**: User clicks movie card from browsing page or directly accesses `/movies/{movieId}` URL. URL parameter (movieId) can be Convex ID (alphanumeric) or TMDB ID (numeric).

2. **Movie Fetching**: Page calls `useMovie(movieId)` hook. Hook detects ID type and checks MoviesProvider cache first for fast retrieval. If cached, returns immediately without Convex query. Otherwise queries Convex: `api.movies.getMovie` for Convex ID or `api.movies.getMovieByTmdbId` for TMDB ID.

3. **Cache Strategy**: useMovie uses useRef to maintain stable cached result across re-renders. Prevents re-renders from Convex query updates. Memoizes ID type detection to avoid unnecessary recalculation.

4. **Data Transformation**: Fetched movie data flows through `transformMovieData()` which builds TMDB image URLs (w500 for posters, original for backdrops) and exposes screenshot data (screenshotUrl template and screenshotIdList array).

5. **Initial State Setup**: Page initializes `currentScreenshotIndex` to 0 (main backdrop). Sets `imageLoaded` to false. On movieId change, resets both states. Determines `hasScreenshots` by checking if screenshotIdList exists and has length > 0.

6. **Screenshot URL Building**: `buildScreenshotUrl()` function handles two cases: index 0 returns backdropUrl (main image); indices 1+ replace `{screenshot_id}` placeholder with screenshotIdList[index-1]. Returns full https://screenmusings.org URL.

7. **Image Preloading**: useEffect preloads next and previous image URLs to enable smooth carousel transitions. Uses native Image() constructor for efficient memory usage.

8. **Keyboard Navigation**: useEffect attaches keydown listener for ArrowLeft/ArrowRight. Prevents default browser behavior and calls handlePreviousScreenshot/handleNextScreenshot. Modulo arithmetic ensures wrap-around navigation (0-10 range for 11 total images).

9. **Image Config Overrides**: Page checks MovieDetailImageConfig by TMDB ID. If override exists and no screenshots available, uses custom posterFilepath (w500) and backdropFilepath (original) instead of database defaults.

10. **Backdrop Rendering**: Renders hero section at configurable height (500px). Uses Image component with fill layout for responsive sizing. Implements cross-fade animation: previous image fades out while new image fades in via opacity transitions controlled by loadingOpacity and screenshotTransitionDuration config values.

11. **Gradient Fade**: If enabled in config, applies bottom gradient overlay (soft/medium/hard intensity) to smoothly transition backdrop to page background. Height and intensity are configurable.

12. **Carousel Controls**: `BackdropCarouselControls` renders conditionally when `hasScreenshots || movie?.backdropUrl`. Positioned absolutely at bottom-left and bottom-right of backdrop. Displays current/total count (e.g., "2/11" = second screenshot of 11 total images).

13. **Layout Direction**: `flexDirection` dynamically set based on MovieDetailUIConfig.poster.position: 'left' → flex-row, 'right' → flex-row-reverse. Enables quick poster repositioning via config change.

14. **Content Overlap**: Negative margin (default -2rem) pulls content section up over backdrop edge, creating cinematic overlay effect. Poster maintains fixed width (250px) with 2:3 aspect ratio. Content area is flex-1 for responsive sizing.

15. **Information Display**: Renders title with release year, duration and genres in styled tags using centralized typography config. Tagline rendered with configurable font style (italic/normal), size, and color. Synopsis paragraph uses optimized reading width and line height. Stats grid (2-4 columns based on screen size) showing rating (/10) and formatted release date.

15.1. **Directors line**: When director IDs are available, the page renders a line directly under the title in the format `Directed by <name1>, <name2>`. Names are resolved via a Convex query to the `people` table (populated during TMDB import from the `credits` payload).

16. **Responsive Behavior**: Flex layout stacks vertically on mobile (flex-col) and horizontally on medium+ screens based on poster.position config. Poster width and info sections scale responsively.

16.1. **Sticky Poster Behavior (md+)**: When `MovieDetailUIConfig.poster.sticky.enabled` is true, the poster column becomes sticky (pinned) within the viewport as the content column scrolls. The sticky top offset is configured via `MovieDetailUIConfig.poster.sticky.topOffset`.

17. **Image Fallbacks**: If activePosterUrl unavailable, shows "No Poster" placeholder. If backdropUrl unavailable, shows muted background. Handles all image load states gracefully.

18. **Type Safety**: All data validated by Movie interface ensuring consistency across transformation, caching, and rendering.

19. **Loading State**: Shows movie data only when movie is available (not null/undefined). Shows "Movie not found" if not loading but movie is null.

This architecture delivers an immersive cinematic experience with efficient dual-query caching, smooth image carousel with keyboard/mouse support, flexible config-driven layout, and precise image curation. The design minimizes code modifications while maximizing visual flexibility.

# Movie Browsing Feature

## File Inventory

### Core Files:
- `apps/web/src/app/movies/page.tsx` - Main movies page component that renders the movie grid with search, filtering, and pagination. Client-side component with state management for pagination and search.
- `apps/web/src/app/movies/layout.tsx` - Layout wrapper for the movies section that wraps children with MoviesProvider for global context access and renders Footer.
- `apps/web/src/components/movie-card.tsx` - Component for displaying individual movie cards in grid or list view. Supports configurable sizing (small/medium/large) and responsive image handling.
- `apps/web/src/hooks/use-movie-browsing.ts` - Custom hook for fetching and managing movie data from MoviesProvider with search/genre filtering and loading states. Memoized for performance.
- `apps/web/src/types/movie.ts` - TypeScript type definitions for Movie interface and search parameters, ensuring type safety across the feature.
- `apps/web/src/lib/movie-utils.ts` - Utility functions for transforming raw Convex movie documents to frontend Movie interface with TMDB image URLs.
- `apps/web/src/providers/MoviesProvider.tsx` - Context provider that manages global movies data state with caching layer, prevents repeated Convex queries.

### Supporting Files:
- `apps/web/src/components/grid-controls.tsx` - UI controls for toggling grid size (small/medium/large) and view mode (grid/list).
- `apps/web/src/components/pagination-controls.tsx` - Component for pagination UI with page navigation and item count display.
- `apps/web/src/config/movie-browsing-ui-config.ts` - Centralized configuration for grid layout, card appearance, spacing, and visibility toggles.
- `apps/web/src/lib/movie-cache.ts` - Client-side caching utilities for storing and validating movies data to reduce server calls.

## Functioning Purpose

- **`movies/page.tsx`**: Main page component orchestrating the browsing interface. Manages state for search query, grid size, view mode, and pagination (12 items per page). Uses sessionStorage to persist current page across reloads. Validates pagination against totalPages to prevent out-of-bounds navigation. Resets to page 1 when search query changes. Computes grid styles dynamically (CSS Grid with auto-fill for grid view, single column for list view) using config values. Renders skeleton loader during data fetch, grid/list of movie cards, pagination controls, and error/empty states with retry options.

- **`movies/layout.tsx`**: Layout wrapper that applies MoviesProvider context to all movie-related pages. Includes Footer component for consistent branding. Enables all child pages to access global movies state.

- **`movie-card.tsx`**: Renders individual movie cards with poster image, title, release year, genres, and optional metadata (rating, duration). Supports grid and list view modes with responsive sizing (small/medium/large). In list view, image is fixed 96x144px; in grid view, uses aspect ratio with relative sizing. Configurable info visibility controlled by MovieBrowsingUIConfig flags. Navigates to movie detail using `/movies/{tmdbId}` or `/movies/{_id}`. Handles image errors with fallback placeholder.

- **`use-movie-browsing.ts`**: Hook retrieving movies from MoviesProvider context. Applies memoized filtering for search query (case-insensitive title match) and optional genre filtering. Supports item limit slicing. Returns processed Movie array via `transformMovieData()`, unique genres list extracted from all movies, and loading/error states. Memoization prevents unnecessary re-renders when props don't change.

- **`movie.ts`**: Defines Movie interface with fields: _id, title, description, posterUrl, backdropUrl, tagline, releaseDate, genres, rating, duration, director, cast, tmdbId, screenshotUrl, screenshotIdList. Ensures type safety throughout the feature.

- **`grid-controls.tsx`**: User controls component for grid customization. Provides grid size selector (small/medium/large) and view mode toggle (grid/list). No filter controls currently implemented.

- **`pagination-controls.tsx`**: Pagination UI component. Displays current range (e.g., "Showing 1 to 12 of 48 results"), previous/next buttons, and clickable page numbers. Implements smart page number truncation with ellipsis for large page counts (shows first/last page and current range).

- **`movie-utils.ts`**: Transforms raw Convex documents to frontend Movie interface. Constructs TMDB image URLs: w500 width for posters (smaller file size), original dimensions for backdrops (quality). Maps database fields (main_poster → posterUrl, main_backdrop → backdropUrl, tmdb_id → tmdbId, etc.). Fallback to synopsis then tagline if description unavailable.

- **`movie-browsing-ui-config.ts`**: Centralized UI configuration. Controls grid gap (1rem small, 1.5rem medium/large), minimum column widths (140px small, 180px medium, 280px large), card aspect ratio (150% for 2:3 posters), card visibility flags (showInfo, showDescription, showRating, showDuration, showWatchlistButton—all false by default), and padding values (0.5rem small, 1rem medium, 1.5rem large).

- **`MoviesProvider.tsx`**: Context provider managing global movies state. Fetches all movies from Convex via `api.movies.getMovies`. Implements client-side caching layer using IndexedDB to reduce server load. On mount, checks cache first; if valid (not stale), uses cached data. Queries `getMoviesDataVersion` to validate cache. If stale, fetches fresh data and updates cache. Provides isLoading and isUsingMoviesCache flags for UI feedback.

- **`movie-cache.ts`**: Utilities for client-side IndexedDB caching. Functions: `getMoviesFromCache()` retrieves cached movies; `saveMoviesToCache()` stores movies with version timestamp; `getCacheStatus()` checks cache metadata; `isCacheMoviesDataStale()` validates against server version; `saveDbFetchTime()` records last fetch timestamp. Enables offline-first experience and faster page loads.

## Interaction

The movie browsing feature creates a cohesive experience through interconnected components:

1. **Provider Setup**: `movies/layout.tsx` wraps pages with `MoviesProvider`, which initiates movie data loading. On mount, MoviesProvider checks IndexedDB cache first. If cache exists and is valid, uses cached data immediately (fast load). Otherwise, fetches all movies from Convex via `api.movies.getMovies` and caches results.

2. **Cache Validation**: MoviesProvider queries `api.movies.getMoviesDataVersion` to get server data version. Compares with cached version to detect staleness. If cache is stale, triggers fresh fetch from Convex.

3. **Data Access**: `movies/page.tsx` uses `useMovies()` hook to access MoviesProvider context. Hook applies search filtering (case-insensitive title match) to movies array. Hook returns processed movies, unique genres list, and loading/error state.

4. **Pagination**: Page component maintains `currentPage` state with sessionStorage persistence across reloads. Calculates totalPages using 12-item-per-page constant. Validates currentPage against totalPages; if out of bounds, resets to page 1.

5. **State Management**: User interactions update local state: search input changes trigger search filter update and page reset to 1; grid size/view mode changes update display settings but maintain current page.

6. **Grid Rendering**: Page computes dynamic grid styles using MovieBrowsingUIConfig. For grid view: CSS Grid with `repeat(auto-fill, minmax(${minWidth}, 1fr))` using responsive min-column-widths from config. For list view: single-column layout (gridTemplateColumns: 1fr).

7. **Movie Cards**: Sliced movies for current page are rendered as `movie-card.tsx` components. Each card reads MovieBrowsingUIConfig to determine visibility of title, description, rating, duration, and watchlist button. Supports grid and list view modes with responsive image sizing.

8. **Navigation**: Each card links to `/movies/{tmdbId}` or `/movies/{_id}`. Link preference prioritizes tmdbId (numeric) for routing to movie detail page.

9. **Pagination Controls**: `pagination-controls.tsx` displays current item range (e.g., "Showing 1 to 12 of 48 results"), previous/next buttons, and page number buttons. Clicking page changes calls `setCurrentPage()`, updating sessionStorage and triggering re-render.

10. **Data Transformation**: Raw Convex documents flow through `transformMovieData()` in the hook. Converts database field names (tmdb_id → tmdbId, main_poster → posterUrl, etc.). Builds TMDB image URLs with appropriate sizing (w500 for posters, original for backdrops).

11. **Loading States**: Page shows skeleton loader (spinning circle with "Loading movies..." text) while `isLoading` is true. Movies list shows cache status via isUsingMoviesCache flag for debugging.

12. **Error Handling**: If error occurs, red alert box displays with "Error loading movies" message and reload button. Empty state shows cinema emoji and message. If search returns no results, prompts user to adjust search criteria.

13. **UI Configuration**: All visual properties (grid gap, card sizes, spacing, element visibility) are driven by MovieBrowsingUIConfig. Changing config values instantly affects entire feature without code modifications.

This architecture enables efficient caching, responsive pagination, and flexible UI configuration while maintaining type safety and component reusability.

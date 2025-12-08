# Movie Browsing Feature

## File Inventory

### Core Files:
- `apps/web/src/app/movies/page.tsx` - Main movies page component that renders the movie grid. Fully styled with Tailwind CSS v4.
- `apps/web/src/app/movies/layout.tsx` - Layout wrapper for the movies section that provides consistent structure with MoviesProvider
- `apps/web/src/components/movie-card.tsx` - Component for displaying individual movie cards with poster, title, and metadata. Includes MovieCardSkeleton export.
- `apps/web/src/hooks/use-movie-browsing.ts` - Custom hook for fetching and managing movie data with search/genre filtering and loading states
- `apps/web/src/types/movie.ts` - TypeScript type definitions for movie entities ensuring type safety
- `apps/web/src/lib/movie-utils.ts` - Utility functions for movie data processing including formatting and transformations
- `apps/web/src/providers/MoviesProvider.tsx` - Context provider that manages global movies data state

### Supporting Files:
- `apps/web/src/components/grid-controls.tsx` - UI controls for grid manipulation (view mode, sort, filter). Refactored to use standard Tailwind classes.
- `apps/web/src/components/pagination-controls.tsx` - Component for browsing through pages of movies. Refactored to use standard Tailwind classes.
- `apps/web/src/config/movie-browsing-ui-config.ts` - Centralized configuration for UI elements in the movie browsing experience, defining layout dimensions and visual properties

## Functioning Purpose

- **`movies/page.tsx`**: The main page component that orchestrates the movie browsing interface. Manages client-side state for search query, grid size, view mode, and pagination (12 items per page). Uses `useMovies()` hook to fetch and filter data from the MoviesProvider. Persists current page to sessionStorage to maintain position on page reload. Renders grid or list view based on user controls and displays error/empty states. Returns paginatedMovies slice for current page view.

- **`movies/layout.tsx`**: Provides consistent layout structure for all movie-related pages. Wraps children with `MoviesProvider` to make global movies context available to all components. Ensures UI consistency across the movie browsing experience.

- **`movie-card.tsx`**: Displays individual movie information in a card format including poster image, title, release year, rating, genres, and duration. Supports both grid and list view modes with responsive sizing (small/medium/large). Each card is clickable and navigates to the movie detail page using `/movies/{tmdbId}` or `/movies/{_id}`. Exports `MovieCardSkeleton` component for loading states.

- **`use-movie-browsing.ts`**: Custom hook that retrieves movies from MoviesProvider context and applies filtering. Handles search query filtering (title match), genre filtering, and item limit. Returns processed movies array via `transformMovieData()`, unique genres list, and loading/error states. Memoizes results to prevent unnecessary re-renders.

- **`movie.ts`**: Defines TypeScript interfaces for movie data structures, ensuring type safety throughout the movie browsing feature. Includes Movie interface with fields for id, title, descriptions, urls, metadata, and tmdbId.

- **`grid-controls.tsx`**: Offers user controls for adjusting how movies are displayed. Provides grid size toggles (S/M/L) and view mode switch (grid/list). Uses Tailwind classes for consistent styling and semantic icons (SVG grid/list icons).

- **`pagination-controls.tsx`**: Enables navigation through paginated movie lists. Shows item range indicator, previous/next buttons, and page number buttons with smart truncation (shows first/last page with ellipsis for large page counts). Displays "Showing X to Y of Z results" summary.

- **`movie-utils.ts`**: Transforms raw Convex movie data to frontend Movie interface. Builds TMDB image URLs from poster/backdrop filepaths with appropriate sizes (w500 for posters, original for backdrops). Maps database fields (tmdb_id, main_poster, etc.) to frontend interface.

- **`movie-browsing-ui-config.ts`**: Centralized configuration file that controls grid layout, card appearance, and responsive behavior. Key settings: grid gap (1.5rem), minimum column widths (140px small, 180px medium, 280px large), card aspect ratio (150% for 2:3 posters), card info display flags (all default to false, hiding titles/ratings/duration by default), and padding values for different screen sizes.

- **`MoviesProvider.tsx`**: Context provider that manages global movies state. Fetches all movies from Convex backend and caches results. Provides isLoading and error states. Consumed by `use-movie-browsing.ts` hook to enable component access to movies data without prop drilling.

## Interaction

The movie browsing feature creates a cohesive experience through interconnected components:

1. **Provider Setup**: `movies/layout.tsx` wraps the page with `MoviesProvider`, which fetches all movies from Convex and caches them in context.

2. **Data Access**: `movies/page.tsx` uses the `useMovies()` hook to access provider context and apply local filters (search query, genre). The hook returns processed movies and loading states.

3. **Pagination**: Page component maintains `currentPage` state with sessionStorage persistence. It calculates pagination with 12 items per page, showing only the current page slice to `movie-card.tsx` components.

4. **State Management**: User interactions with `grid-controls.tsx` (grid size, view mode) and search input update page state. When search query changes, current page resets to 1 to avoid confusion.

5. **Grid Rendering**: The page computes dynamic grid styles using `MovieBrowsingUIConfig` values. For grid view, it uses CSS Grid with `auto-fill` and responsive min-column-widths. For list view, it's a single-column layout.

6. **Movie Cards**: Each movie is rendered as a `movie-card.tsx` component. Cards support both grid and list modes, with configurable info visibility (titles, ratings, descriptions disabled by default per config).

7. **Navigation**: Each card links to `/movies/{tmdbId}` or `/movies/{_id}`, routing to the movie detail page.

8. **Pagination Controls**: `pagination-controls.tsx` displays page numbers and navigation buttons. Shows item range summary and handles page changes, which updates sessionStorage and triggers re-render.

9. **Data Transformation**: The `movie-utils.ts` `transformMovieData()` function is called by the hook to convert raw Convex documents to frontend Movie types, building TMDB image URLs.

10. **Error Handling**: If an error occurs, a red alert box displays with a retry button. Empty states show a cinema emoji and prompt to load sample movies if no movies exist.

11. **UI Configuration**: All visual properties (colors, sizes, spacing) are driven by `MovieBrowsingUIConfig`. Updating config values automatically affects the entire grid, cards, and controls without code changes.

This architecture creates a responsive, dynamic movie browsing experience with centralized configuration, efficient pagination, and flexible filtering.

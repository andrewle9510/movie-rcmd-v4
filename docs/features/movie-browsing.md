# Movie Browsing Feature

Movie browsing enables users to discover, search, filter, and browse movies in a flexible grid layout with multiple view modes.

## File Inventory

### Core Components:
- `apps/web/src/features/movie-browsing/components/movie-card.tsx` - Individual movie card display with poster, title, genres, rating
- `apps/web/src/features/movie-browsing/components/movie-card-skeleton.tsx` - Skeleton loader for movie cards
- `apps/web/src/features/movie-browsing/components/grid-controls.tsx` - Controls for grid size and view mode switching
- `apps/web/src/features/movie-browsing/components/pagination-controls.tsx` - Pagination UI for browsing movies
- `apps/web/src/features/movie-browsing/components/backdrop-carousel-controls.tsx` - Navigation controls for image carousels
- `apps/web/src/features/movie-browsing/components/movie-refresh-button.tsx` - Button to refresh movie data

### Hooks:
- `apps/web/src/features/movie-browsing/hooks/use-movie-browsing.ts` - Core hook for fetching, filtering, and searching movies with genre filtering

### Utilities:
- `apps/web/src/features/movie-browsing/utils/movie-browsing-ui-config.ts` - Centralized UI configuration for layout, grid, and card appearance
- `apps/web/src/features/movie-browsing/utils/movie-utils.ts` - Data transformation utilities (TMDB data → internal Movie type)
- `apps/web/src/features/movie-browsing/utils/movie-cache.ts` - Local storage caching utilities for movies data

## Functioning Purpose

- **MovieCard**: Renders individual movie with poster image, title, genres, release year, rating, and duration. Supports grid and list view modes with responsive sizing
- **MovieCardSkeleton**: Provides loading placeholder matching card dimensions
- **GridControls**: Allows users to switch between small/medium/large grid sizes and toggle grid/list view modes
- **PaginationControls**: Manages page navigation with total items and items-per-page display
- **BackdropCarouselControls**: Left/right navigation buttons for cycling through backdrop images
- **MovieRefreshButton**: Triggers data refresh from backend
- **useMoviesBrowsing Hook**: Manages movie data fetching from context, applies search/filter/limit logic, extracts unique genres
- **MovieBrowsingUIConfig**: Centralized configuration object controlling card appearance, grid gaps, padding (customizable per screen size)
- **transformMovieData**: Converts Convex movie documents to internal Movie type with TMDB image URLs
- **movie-cache utilities**: Handles localStorage persistence for cached movies with version tracking and staleness detection

## Interaction

1. **Data Flow**: `MoviesProvider` (in shared) loads movies from Convex or cache → `useMoviesBrowsing` hook retrieves and filters data → components render grid/list
2. **User Actions**: 
   - Search input filters movies by title
   - GridControls changes card size and view mode
   - PaginationControls navigate between pages
   - MovieCard navigates to detail page on click
3. **Caching**: Movies cached in localStorage with version tracking to detect stale data
4. **Responsive**: MovieBrowsingUIConfig provides breakpoint-aware sizing (small/medium/large grid columns)

## Dependencies

- **movie-detail**: BackdropCarouselControls uses MovieDetailUIConfig from movie-detail feature
- **shared**: Uses MovieBrowsingUIConfig from features, Movie type from shared/types
- **Convex**: Queries api.movies for fetching movie data

## Configuration

Adjust appearance by modifying `movie-browsing-ui-config.ts`:
- `card.aspectRatio`: Poster image aspect ratio (default: "150%" for 2:3)
- `grid.minColumnWidth`: Responsive column widths (small/medium/large)
- `card.showInfo`, `showRating`, `showDuration`: Toggle card information display
- `card.padding`: Internal card spacing

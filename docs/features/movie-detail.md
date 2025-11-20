# Movie Detail Feature

## File Inventory

### Core Files:
- `apps/web/src/app/movies/[movieId]/page.tsx` - Dynamic page component for displaying individual movie details
- `apps/web/src/config/movie-detail-ui-config.ts` - Centralized configuration for movie detail page UI layout and positioning
- `apps/web/src/hooks/use-movie.ts` - Custom hook for fetching and managing individual movie data
- `apps/web/src/lib/movie-utils.ts` - Utility functions for movie detail data processing

### Supporting Files:
- `apps/web/src/types/movie.ts` - TypeScript type definitions for movie detail entities
- `apps/web/src/app/movies/layout.tsx` - Layout wrapper for the movie detail page

## Functioning Purpose

- **`movies/[movieId]/page.tsx`**: The dynamic page component that renders detailed information about a specific movie. It uses the movie ID from the URL to fetch data and displays comprehensive movie information. It directly handles the hero section and content layout, adapting the UI based on the `MovieDetailUIConfig`.

- **`movie-detail-ui-config.ts`**: Defines the layout constants for the movie detail page, including backdrop height, content spacing, and the poster's position (left vs. right). This allows for easy UI adjustments without modifying component logic.

- **`use-movie.ts`**: Manages data fetching, caching, and state management for individual movie details. Handles API calls to retrieve comprehensive movie information based on the movie ID, implements loading states, and provides error handling.

- **`movie-utils.ts`**: Provides utility functions specifically for movie detail data processing, such as formatting runtime, calculating rating averages, and transforming cast/crew data for display.

- **`movie.ts`**: Contains TypeScript interfaces specific to movie detail data structures, ensuring type safety throughout the movie detail feature.

- **`movies/layout.tsx`**: Provides consistent layout structure for the movie detail page, maintaining UI consistency between the movie browsing and detail views.

## Interaction

The movie detail feature creates a comprehensive view of individual movies through interconnected components:

1. When a user clicks on a movie card from the browsing page, they are routed to the dynamic `movies/[movieId]/page.tsx` with the specific movie ID.

2. The page component uses the `use-movie.ts` hook to fetch detailed movie data based on the ID from the URL parameters.

3. While data is loading, the page displays a loading state.

4. Once data is loaded, the page renders the hero section (with backdrop) and the main content area. The layout (poster position, spacing) is dynamically controlled by `MovieDetailUIConfig`.

5. The page component organizes and displays additional movie details such as synopsis, cast, crew, reviews, and recommendations in a structured format.

6. Utility functions from `movie-utils.ts` are used to format and transform raw movie data into display-friendly formats throughout the page.

7. The `movie.ts` type definitions ensure all data flowing through the feature is properly typed and validated.

8. The shared layout from `movies/layout.tsx` provides consistency with the rest of the movie browsing experience.

This architecture creates an immersive, informative movie detail experience that efficiently handles data fetching, visual presentation, and user navigation. The feature maintains visual consistency with the browsing page while providing deeper, more comprehensive information about individual movies.

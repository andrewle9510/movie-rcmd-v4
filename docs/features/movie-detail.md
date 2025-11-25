# Movie Detail Feature

## File Inventory

### Core Files:
- `apps/web/src/app/movies/[movieId]/page.tsx` - Dynamic page component for displaying individual movie details with cinematic layout
- `apps/web/src/config/movie-detail-ui-config.ts` - Centralized configuration for movie detail page UI layout, backdrop, and poster positioning
- `apps/web/src/config/movie-detail-backdrop-poster-config.ts` - Manual configuration for overriding default poster/backdrop images with specific TMDB filepaths
- `apps/web/src/hooks/use-movie.ts` - Custom hook for fetching and managing individual movie data with loading states
- `apps/web/src/lib/movie-utils.ts` - Utility functions for movie detail data processing including formatting and transformations

### Supporting Files:
- `apps/web/src/types/movie.ts` - TypeScript type definitions for movie detail entities ensuring type safety
- `apps/web/src/app/movies/layout.tsx` - Layout wrapper for the movie detail page providing consistent structure

## Functioning Purpose

- **`movies/[movieId]/page.tsx`**: The dynamic page component that renders detailed information about a specific movie in a cinematic layout. It uses the movie ID from the URL to fetch data and displays comprehensive movie information with a hero backdrop section and main content area. The page checks for manual poster/backdrop filepaths from `MovieDetailImageConfig` and dynamically adjusts the layout based on `MovieDetailUIConfig` settings including poster position (left/right) and backdrop styling options.

- **`movie-detail-ui-config.ts`**: Defines the UI configuration constants for the movie detail page, including backdrop height, content negative margin, opacity, bottom fade effects, and poster positioning. This centralized approach allows for easy visual adjustments without modifying component logic.

- **`movie-detail-backdrop-poster-config.ts`**: Provides manual overrides for specific movies by TMDB ID, allowing custom poster and backdrop filepaths to be used instead of the default database-stored images. This enables precise control over which TMDB images are displayed for particular movies.

- **`use-movie.ts`**: Manages data fetching, caching, and state management for individual movie details. Handles API calls to retrieve comprehensive movie information based on the movie ID, implements loading states, and provides error handling.

- **`movie-utils.ts`**: Provides utility functions specifically for movie detail data processing, such as formatting runtime, calculating rating averages, and transforming metadata for display.

- **`movie.ts`**: Contains TypeScript interfaces specific to movie detail data structures, ensuring type safety throughout the movie detail feature.

- **`movies/layout.tsx`**: Provides consistent layout structure for the movie detail page, maintaining UI consistency between the movie browsing and detail views.

## Interaction

The movie detail feature creates a comprehensive cinematic view of individual movies through interconnected components:

1. When a user clicks on a movie card from the browsing page, they are routed to the dynamic `movies/[movieId]/page.tsx` with the specific movie ID.

2. The page component uses the `use-movie.ts` hook to fetch detailed movie data based on the ID from the URL parameters.

3. While data is loading, the page displays a loading state.

4. Once data is loaded, the page renders a cinematic layout with:
   - A hero backdrop section with configurable height, opacity, and bottom fade gradient
   - A main content area with poster and movie details positioned according to `MovieDetailUIConfig`

5. The page checks `MovieDetailImageConfig` for any manual poster/backdrop filepaths for the specific movie (by TMDB ID) and uses those instead of the default database images if configured.

6. The layout dynamically adjusts based on configuration settings:
   - Poster positioning (left or right side)
   - Backdrop styling with configurable fade effects
   - Content spacing and negative margins for overlapping backdrop

7. The page component organizes and displays movie details including title, year, rating, duration, genres, tagline, synopsis, and release date in a structured format.

8. Utility functions from `movie-utils.ts` are used to format and transform raw movie data into display-friendly formats throughout the page.

9. The `movie.ts` type definitions ensure all data flowing through the feature is properly typed and validated.

10. The shared layout from `movies/layout.tsx` provides consistency with the rest of the movie browsing experience.

This architecture creates an immersive, cinematic movie detail experience that efficiently handles data fetching, visual presentation, and user navigation. The feature maintains visual consistency with the browsing page while providing deeper, more comprehensive information about individual movies. The centralized configuration approach allows for easy customization of the visual presentation without modifying component logic, and the manual image override capability provides precise control over which images are displayed for specific movies.

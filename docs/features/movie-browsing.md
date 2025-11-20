# Movie Browsing Feature

## File Inventory

### Core Files:
- `apps/web/src/app/movies/page.tsx` - Main movies page component that renders the movie grid. Now fully styled with Tailwind CSS v4.
- `apps/web/src/app/movies/layout.tsx` - Layout wrapper for the movies section
- `apps/web/src/components/movie-card.tsx` - Component for displaying individual movie cards
- `apps/web/src/components/movie-card-skeleton.tsx` - Loading skeleton component for movie cards
- `apps/web/src/hooks/use-movies.ts` - Custom hook for fetching and managing movie data
- `apps/web/src/types/movie.ts` - TypeScript type definitions for movie entities

### Supporting Files:
- `apps/web/src/components/grid-controls.tsx` - UI controls for grid manipulation (view mode, sort, filter). Styled with Tailwind CSS v4.
- `apps/web/src/components/pagination-controls.tsx` - Component for browsing through pages of movies. Styled with Tailwind CSS v4.
- `apps/web/src/lib/movie-utils.ts` - Utility functions for movie data processing
- `apps/web/src/config/movie-browsing-ui-config.ts` - Centralized configuration for UI elements in the movie browsing experience

## Functioning Purpose

- **`movies/page.tsx`**: The main page component that orchestrates the movie browsing interface. It handles the overall layout, manages browsing state, and coordinates between child components. This component renders the grid of movie cards and integrates with pagination and filtering controls. It has been refactored to use native HTML elements and Tailwind utility classes for styling, replacing the deprecated `ui-simple.tsx` components.

- **`movies/layout.tsx`**: Provides consistent layout structure for all movie-related pages, ensuring UI consistency across the movie browsing experience.

- **`movie-card.tsx`**: Displays individual movie information in a card format including poster image, title, release year, rating, and other key metadata. Each card is clickable and navigates to the movie detail page.

- **`movie-card-skeleton.tsx`**: Provides a loading placeholder while movie data is being fetched, maintaining layout stability during data loading.

- **`use-movies.ts`**: Manages data fetching, caching, and state management for movie lists. Handles API calls to retrieve movies, implements loading states, error handling, and provides data transformation.

- **`movie.ts`**: Defines TypeScript interfaces for movie data structures, ensuring type safety throughout the movie browsing feature.

- **`grid-controls.tsx`**: Offers user controls for adjusting how movies are displayed, including view modes, sorting options, and filtering capabilities. Refactored to use standard Tailwind classes for better theme integration and responsiveness.

- **`pagination-controls.tsx`**: Enables navigation through multiple pages of movies, with controls for page navigation and items per page selection. Refactored to use standard Tailwind classes.

- **`movie-utils.ts`**: Contains helper functions for processing movie data, such as formatting dates, calculating ratings, and other data transformations.

- **`movie-browsing-ui-config.ts`**: Centralizes UI configuration for the movie browsing experience, defining layout dimensions, grid spacings, card appearance, and other visual elements. This allows for easy customization of the movie browsing UI without modifying component logic.

## Interaction

The movie browsing feature creates a cohesive experience through interconnected components:

1. The `movies/page.tsx` serves as the main container, orchestrating layout and connecting all child components.

2. The `use-movies.ts` hook provides movie data to the page component, handling data fetching with loading states indicated by `movie-card-skeleton.tsx` placeholders.

3. Movie cards are dynamically rendered based on the data from the hook. Each card represents an individual movie with key information and visual elements.

4. The `grid-controls.tsx` and `pagination-controls.tsx` components provide user interaction capabilities, allowing users to customize their browsing experience.

5. When users interact with controls, the state changes trigger the hook to fetch updated data, which then re-renders the movie grid accordingly.

6. Each movie card is clickable, navigating users to the movie detail page for more in-depth information.

7. The `movie-utils.ts` functions support data transformation needs across multiple components, ensuring consistent data formatting.

8. The `movie-browsing-ui-config.ts` provides a centralized configuration approach, allowing visual adjustments to be made consistently across the movie grid and cards without modifying component logic. The `movies/page.tsx` and `movie-card.tsx` both reference this configuration to maintain UI consistency.

This architecture creates a responsive, dynamic movie browsing experience that efficiently handles data fetching, user interactions, and visual presentation.

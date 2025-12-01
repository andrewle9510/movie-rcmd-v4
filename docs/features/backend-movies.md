# Backend Movies Feature

Movies feature provides core queries and data structures for movie information in the Convex database.

## File Inventory

### Core Files:
- `packages/backend/convex/features/movies/queries/movies.ts` - Movie queries (get by ID, get by TMDB ID, search, paginate)
- `packages/backend/convex/features/movies/movieDataInterfaces.ts` - TypeScript interfaces for TMDB API responses and internal database structures

## Functioning Purpose

- **queries/movies.ts**:
  - `getAllMovies()`: Internal query to fetch all movies (maintenance only)
  - `getMovie()`: Query a single movie by Convex database ID
  - `getMovieByTmdbId()`: Query a single movie by TMDB ID
  - `searchMovies()`: Search movies by title, genres, release year with pagination
  - `getMovies()`: Fetch all movies (main client-facing query)
  - `getMoviesDataVersion()`: Get version hash for cache staleness detection
  - `getMoviesByGenre()`: Filter movies by genre with pagination
  - `getMovieCount()`: Get total count of movies in database

- **movieDataInterfaces.ts**: Type definitions for TMDB API responses and database movie structure

## Database Schema

The `movies` table contains:
- TMDB metadata: `tmdb_id`, `title`, `original_title`, `original_language`, `release_date`, `runtime_minutes`
- Content: `synopsis`, `tagline`, `status`, `trailer_url`
- Images: `main_poster`, `main_backdrop`, `screenshots`, `screenshot_id_list`, `screenshot_url`
- Ratings: `vote_count_system`, `vote_pts_system` (IMDB, Letterboxd, Metacritic, Rotten Tomatoes, TMDB)
- Metadata: `cast`, `directors`, `genres`, `keywords`, `production_studio`, `country`, `language`, `mood`
- Financial: `budget`, `revenue`, `popularity`, `mpaa_rating`
- Relations: `belong_to_collection`
- Tracking: `created_at`, `updated_at`, `tmdb_data_imported_at`

## Indices

- `by_tmdb_id`: Fast lookup by TMDB ID
- `by_slug`: Fast lookup by URL slug

## Related Features

- **tmdb-sync**: Imports movie data from TMDB API
- **watchlist**: Links user interactions to movies
- **frontend**: Consumes movie queries via `useMovies()` hook

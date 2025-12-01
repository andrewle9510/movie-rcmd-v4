# Backend TMDB Sync Feature

TMDB sync orchestrates importing movie data from The Movie Database API into Convex database.

## File Inventory

### Actions:
- `packages/backend/convex/features/tmdb-sync/actions/tmdbFetcher.ts` - TMDB API client with retry logic
- `packages/backend/convex/features/tmdb-sync/actions/tmdbLocalFetch.ts` - Action to fetch and save movies locally
- `packages/backend/convex/features/tmdb-sync/actions/dbImporter.ts` - Import local data into Convex database
- `packages/backend/convex/features/tmdb-sync/actions/execConvexImportTmdbWorkflow.ts` - Orchestrate direct TMDB-to-Convex import
- `packages/backend/convex/features/tmdb-sync/actions/execLocalImportTmdbWorkflow.ts` - Orchestrate local file-based import

### Shared:
- `packages/backend/convex/features/tmdb-sync/movieDataInterfaces.ts` - Type definitions (shared with movies feature)

## Functioning Purpose

### TMDB Fetcher (`tmdbFetcher.ts`)
- `fetchFromTmdb()`: Low-level TMDB API request with:
  - Retry logic (exponential backoff for rate limiting)
  - Rate limit handling (429 responses)
  - Error handling for network and API failures
- `transformTmdbMovieToDbStructure()`: Transform TMDB API response to Convex database schema
- Handles image URL construction for posters and backdrops

### Local Fetch (`tmdbLocalFetch.ts`)
- `fetchAndSaveMovie()`: Fetch single movie from TMDB and save to local file
- `fetchAndSaveMovies()`: Fetch multiple movies by IDs
- Useful for gradual/resume-able imports

### Database Importer (`dbImporter.ts`)
- `createMovieFromTmdbData()`: Create or update movie document in Convex
- `createMoviesFromLocalData()`: Batch import from local files
- `updateMovieData()`: Refresh existing movie with new TMDB data
- `deleteMovie()`: Remove movie from database

### Workflows
- **Direct Import** (`execConvexImportTmdbWorkflow.ts`): Fetch from TMDB → Save to Convex in one action
  - `runTmdbDirectImportWorkflow()`: Import single movie
  - `runBatchDirectImportWorkflow()`: Import multiple movies

- **Local Import** (`execLocalImportTmdbWorkflow.ts`): Fetch TMDB → Save locally → Import → Update database
  - `runTmdbLocalImportWorkflow()`: Full workflow with progress tracking
  - Better for large imports (network resilience)

## Rate Limiting

TMDB API has strict rate limits. The fetcher implements:
- Exponential backoff on rate limit (429) responses
- Retry configuration (default 3 retries)
- Retry-After header respect from TMDB

## Data Transformation

Fields transformed from TMDB API to database schema:
- `poster_path` → `main_poster` (TMDB image URL prefix applied)
- `backdrop_path` → `main_backdrop`
- `release_date` → `release_date`
- Genre IDs, cast IDs, crew IDs preserved as arrays
- Rating aggregation: IMDB, Letterboxd, Metacritic, Rotten Tomatoes, TMDB
- Genre mappings and metadata preservation

## Related Features

- **movies**: Provides schema and queries for stored movies
- **frontend**: Triggers sync operations via Convex actions

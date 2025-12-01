# Backend Convex Refactoring Summary

## Overview

Refactored `packages/backend/convex` from a flat structure to a feature-based architecture, organizing Convex functions by domain feature with logical separation of queries, mutations, and actions.

## Before & After Structure

### Before
```
packages/backend/convex/
├── _generated/
├── lib/
├── dbImporter.ts
├── execConvexImportTmdbWorkflow.ts
├── execLocalImportTmdbWorkflow.ts
├── healthCheck.ts
├── migrations.ts
├── movieDataInterfaces.ts
├── movies.ts
├── schema.ts
├── tmdbFetcher.ts
├── tmdbLocalFetch.ts
├── user_events.ts
├── user_movie_lists.ts
├── users.ts
├── README.md
└── tsconfig.json
```

### After
```
packages/backend/convex/
├── features/
│   ├── movies/
│   │   ├── queries/
│   │   │   └── movies.ts
│   │   └── movieDataInterfaces.ts
│   ├── users/
│   │   ├── queries/
│   │   │   └── users.ts
│   │   └── mutations/
│   │       └── user_events.ts
│   ├── watchlist/
│   │   └── queries/
│   │       └── user_movie_lists.ts
│   └── tmdb-sync/
│       ├── actions/
│       │   ├── tmdbFetcher.ts
│       │   ├── tmdbLocalFetch.ts
│       │   ├── dbImporter.ts
│       │   ├── execConvexImportTmdbWorkflow.ts
│       │   └── execLocalImportTmdbWorkflow.ts
│       └── movieDataInterfaces.ts
├── _generated/
├── lib/
│   ├── utils.ts
│   ├── migrations.ts
│   └── healthCheck.ts
├── schema.ts
├── README.md
└── tsconfig.json
```

## Changes Made

### Feature Organization

**Movies Feature** - Core movie data:
- Moved `movies.ts` → `features/movies/queries/movies.ts`
- Moved `movieDataInterfaces.ts` → `features/movies/movieDataInterfaces.ts`
- Contains all movie queries (get, search, paginate, version tracking)

**Users Feature** - User profiles and events:
- Moved `users.ts` → `features/users/queries/users.ts`
- Moved `user_events.ts` → `features/users/mutations/user_events.ts`
- Separated queries (profile lookup) from mutations (event recording, profile updates)

**Watchlist Feature** - User-movie interactions:
- Moved `user_movie_lists.ts` → `features/watchlist/queries/user_movie_lists.ts`
- Manages user movie list relationships and ratings

**TMDB Sync Feature** - Data import orchestration:
- Moved `tmdbFetcher.ts` → `features/tmdb-sync/actions/tmdbFetcher.ts`
- Moved `tmdbLocalFetch.ts` → `features/tmdb-sync/actions/tmdbLocalFetch.ts`
- Moved `dbImporter.ts` → `features/tmdb-sync/actions/dbImporter.ts`
- Moved `execConvexImportTmdbWorkflow.ts` → `features/tmdb-sync/actions/execConvexImportTmdbWorkflow.ts`
- Moved `execLocalImportTmdbWorkflow.ts` → `features/tmdb-sync/actions/execLocalImportTmdbWorkflow.ts`
- Supports duplicate `movieDataInterfaces.ts` for type definitions

### Utility Organization

Consolidated utility functions in `lib/`:
- `lib/utils.ts` - Screenshot URL parsing and data transformation
- `lib/migrations.ts` - Database migrations
- `lib/healthCheck.ts` - System health monitoring

Central files remain at root:
- `schema.ts` - Database schema definitions
- `_generated/` - Convex auto-generated types and API

## Import Path Updates

All files updated with corrected relative import paths:

| File Location | Import Pattern | Updated To |
|---|---|---|
| `features/*/queries/*.ts` | `./_generated/server` | `../../../_generated/server` |
| `features/*/mutations/*.ts` | `./_generated/server` | `../../../_generated/server` |
| `features/*/actions/*.ts` | `./_generated/server` | `../../../_generated/server` |
| All features | `./_generated/dataModel` | `../../../_generated/dataModel` |
| All features | `./_generated/api` | `../../../_generated/api` |
| tmdb-sync actions | `./lib/utils` | `../../../lib/utils` |
| tmdb-sync actions | `./movieDataInterfaces` | `../movieDataInterfaces` |

## Files Updated

All Convex feature files had imports updated:
- `features/movies/queries/movies.ts`
- `features/users/queries/users.ts`
- `features/users/mutations/user_events.ts`
- `features/watchlist/queries/user_movie_lists.ts`
- `features/tmdb-sync/actions/tmdbFetcher.ts`
- `features/tmdb-sync/actions/tmdbLocalFetch.ts`
- `features/tmdb-sync/actions/dbImporter.ts`
- `features/tmdb-sync/actions/execConvexImportTmdbWorkflow.ts`
- `features/tmdb-sync/actions/execLocalImportTmdbWorkflow.ts`

## Benefits

1. **Clarity**: Feature boundaries clearly defined
2. **Separation of Concerns**: Queries, mutations, and actions organized logically
3. **Scalability**: Easy to add new features without cluttering root
4. **Discoverability**: Locate related functions by feature
5. **Maintainability**: Related code grouped together
6. **Consistency**: Aligns with frontend feature organization

## Testing Notes

- Import paths corrected for relative module resolution
- All functions remain functionally identical
- No behavioral changes to Convex operations
- Can deploy directly with `npx convex deploy`

## Potential Future Improvements

1. Create `index.ts` files in each feature for cleaner imports
2. Add shared types package for cross-feature types
3. Extract common patterns (pagination, filtering) to feature templates
4. Document feature API contracts per feature

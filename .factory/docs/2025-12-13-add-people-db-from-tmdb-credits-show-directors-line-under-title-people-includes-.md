## Confirmed requirements
- Show directors under movie title on `apps/web/src/app/movies/[movieId]/page.tsx` as:
  - `Directed by director01, director02`
- Keep `movies.directors` and `movies.cast` as **IDs only**.
- Add a new Convex `people` table storing **top-N cast + directors** people info.
- Populate/update `people` **during the existing TMDB movie fetch/import step** (we already have `credits`), **no extra TMDB `/person/{id}` fetches**.
- Defer links until a `/people/[personId]` page exists.

---

## Data model
### New Convex table: `people`
Fields (now 6):
1. `tmdb_person_id: number`
2. `name: string`
3. `profile_path: string | null`
4. `department: string | null` (from credits: `known_for_department ?? department ?? null`)
5. `character: string | null` (cast-only; from `credits.cast[].character`)
6. `updated_at: string` (ISO)

### Index
Add index `by_tmdb_person_id` on `tmdb_person_id`.
- Convex requires an explicit index for efficient lookups; having the field alone doesn’t create one.

---

## Ingestion/update (populate people from credits payload)
### Where this runs
In the backend TMDB import/transform pipeline (currently `packages/backend/convex/tmdbFetcher.ts` fetches `/movie/{id}` with `append_to_response: 'credits,...'`).

### What we will do
At import/update time:
1. Directors:
   - Extract from `credits.crew` where `job === 'Director'`.
   - Map to people records with `character = null`.
2. Cast:
   - Extract top N from `credits.cast` (sorted by `order`, sliced to N).
   - Map to people records including `character`.
3. De-dup by `tmdb_person_id` and upsert:
   - If missing: insert.
   - If exists: patch fields + `updated_at`.

Note: if a person appears in both cast and crew across different movies, `character` is movie-specific; we’ll store whatever is present for the upserted record. If you want character to be per-movie, we’d need a join table instead—out of scope unless you request it.

---

## Query surface for the UI
Add a Convex query:
- `getPeopleByTmdbIds({ ids: number[] }) -> { tmdb_person_id, name, profile_path, department, character }[]`

For the directors line, we only use `name`.

---

## Frontend change (movie detail page)
1. Ensure the movie payload exposed to the frontend includes director IDs (e.g. add `directorIds: number[]` to `apps/web/src/types/movie.ts` and map it in `transformMovieData()` from `movie.directors`).
2. In `apps/web/src/app/movies/[movieId]/page.tsx`, after `movie` loads:
   - query people for those director IDs
   - render under `<h1>`: `Directed by ...` (comma-separated names), only when available.

---

## Backfill for existing movies
We’ll need a backfill plan so existing movies have `people` rows.
Because you don’t want `/person/{id}` fetches, backfill must come from re-fetching each movie’s credits (or from already-stored credits if present). We’ll decide the exact mechanism in implementation planning.

---

## Files expected to change
- `packages/backend/convex/schema.ts` (add `people` table + index)
- `packages/backend/convex/tmdbFetcher.ts` (upsert people from credits during import/update)
- `packages/backend/convex/movies.ts` (query to retrieve people by TMDB ids)
- `apps/web/src/types/movie.ts` + `apps/web/src/lib/movie-utils.ts` (expose director IDs)
- `apps/web/src/app/movies/[movieId]/page.tsx` (render “Directed by …”)
- `docs/features/movie-detail.md` (keep docs in sync)

---

## Validation (post-approval)
Run lint + typecheck + tests per repo scripts.

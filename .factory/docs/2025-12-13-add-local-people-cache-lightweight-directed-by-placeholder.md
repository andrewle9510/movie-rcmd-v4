## Goal
1) Cache people (at least director/cast names) in browser `localStorage` so “Directed by …” renders quickly on repeat visits.
2) Show a lightweight placeholder while director names are loading.

## Design: `people-cache` (localStorage)
### Storage key
- `people-cache` (JSON)

### Shape (simple map)
```ts
type PeopleCache = {
  [tmdb_person_id: number]: {
    tmdb_person_id: number;
    name: string;
    profile_path: string | null;
    department: string | null;
    character: string | null;
    updated_at: string; // from Convex people table
  };
};
```

### Helpers (new file)
Create `apps/web/src/lib/people-cache.ts`:
- `getPeopleMapFromCache(): PeopleCache`
- `getPeopleFromCache(ids: number[]): PeopleCache` (subset)
- `savePeopleToCache(people: any[]): void` (merge into existing cache)

Guards:
- Only run when `typeof window !== 'undefined'`
- Wrap JSON parse in try/catch

No TTL initially; we rely on `updated_at` + “refresh-on-view” behavior.

## Movie detail page behavior
Update `apps/web/src/app/movies/[movieId]/page.tsx`:
1. When `movie.directorIds` exists:
   - Read cached people for those ids (sync).
   - Kick off Convex `useQuery(api.people.getPeopleByTmdbIds, { ids })` as now.
2. Compute `directorNames` preferring cached values first; fall back to Convex result.
3. When Convex `directorsPeople` arrives (non-undefined), call `savePeopleToCache(directorsPeople)` to refresh local cache.

### Placeholder
Render under the title:
- If `movie.directorIds.length > 0` **and** director names not resolved yet **and** the Convex query is still loading (`directorsPeople === undefined`):
  - show a muted line: `Directed by …`

Once names available:
- render `Directed by name1, name2`.

## Files to change (after approval)
- Add: `apps/web/src/lib/people-cache.ts`
- Update: `apps/web/src/app/movies/[movieId]/page.tsx`

## Validation (after approval)
- Run `npx tsc -p apps/web/tsconfig.json --noEmit`.

If you approve, I’ll implement this exactly (no TTL, merge-only cache) and keep the placeholder minimal (no new UI components).
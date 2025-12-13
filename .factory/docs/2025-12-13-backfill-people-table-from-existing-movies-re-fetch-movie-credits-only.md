## Goal
Populate the `people` table for movies already in Convex by **re-fetching each movie** from TMDB with `append_to_response=credits,...` and then upserting people from that credits payload.

This satisfies your constraint: **no per-person `/person/{id}` TMDB calls**.

---

## Key observation (good news)
We already added logic so that **calling** `internal.tmdbLocalFetch.fetchAndSaveMovie({ tmdbId })` will:
1. fetch the movie from TMDB (includes `credits`)
2. run `extractPeopleFromCredits(...)`
3. `upsertPeople(...)`

So backfill just needs to loop over existing movie `tmdb_id`s and call that action.

---

## Proposed implementation
### Add a new Convex action: `peopleBackfill.backfillPeopleFromExistingMovies`
Location: `packages/backend/convex/peopleBackfill.ts`

**Args:**
- `limit?: number` (default 50)
- `offset?: number` (default 0)
- `delayMs?: number` (default 300)

**Handler logic:**
1. Fetch all movies’ `tmdb_id` (use existing internal query `movies.getAllMovies`)
2. Slice `[offset, offset+limit)`
3. For each tmdbId:
   - `await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveMovie, { tmdbId })`
   - `await sleep(delayMs)`
4. Return stats: totalMovies, processed, succeeded, failed, nextOffset.

This is resumable: run it repeatedly increasing `offset`.

---

## How you’ll run it (after implementation)
Example (batch 50):
- Run batch 1: `{ offset: 0, limit: 50, delayMs: 300 }`
- Run batch 2: `{ offset: 50, limit: 50, delayMs: 300 }`
- …until done.

I’ll provide the exact CLI invocation (Convex dashboard or `npx convex run ...`) once the action exists.

---

## Notes / tradeoffs
- This will also **refresh the on-disk TMDB movie payload** returned by TMDB; but it won’t necessarily patch your `movies` table unless your workflow explicitly imports the db_structure_data. Our current hook is: `fetchAndSaveMovie` → upsert people. So it’s targeted.
- TMDB rate limits: delayMs helps; the fetch helper also retries on 429.

---

## Approval request
Approve this spec and I’ll:
1. Add `peopleBackfill.ts` action
2. Run `npx convex codegen`
3. Tell you the exact command(s) to execute the backfill in batches and how to verify `people` count.

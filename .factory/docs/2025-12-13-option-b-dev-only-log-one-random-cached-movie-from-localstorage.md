## Goal
Add a **dev-only** console log that prints a **random movie** from the browser cache (`localStorage['movie-cache']`) so you can see what’s cached without manually running console code.

## Where to add it (minimal, centralized)
Add it to `apps/web/src/providers/MoviesProvider.tsx`, inside the existing effect that loads cache:
- That effect already calls `getMoviesFromCache()` and logs count.
- We’ll extend it to log one random entry.

## Dev-only guard (important)
We’ll guard the log so it only runs in development:
- `if (process.env.NODE_ENV !== 'development') return;`
This avoids noisy logs in prod.

## Behavior
When you load/refresh the app:
1. If cache exists, console will show:
   - cached count
   - one random cached movie object (full JSON)
2. If no cache exists, it logs nothing extra.

## Example output
- `📦 Setting movies from cache, count: 123`
- `🎲 Random cached movie: { ...movie doc... }`

## Files to change (after you approve)
- `apps/web/src/providers/MoviesProvider.tsx`

If you approve, I’ll implement this small change and you can refresh the web app and paste the logged object here if you want me to inspect it.
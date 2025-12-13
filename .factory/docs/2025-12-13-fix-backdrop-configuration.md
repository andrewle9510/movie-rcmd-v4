## Fix Backdrop Configuration Issue

**Problem**: The `backdropFilepath` setting in `movie-detail-backdrop-poster-config.ts` isn't working because it's only applied when `displayUrl` is empty, but `displayUrl` always gets the default backdrop URL first.

**Solution**: Modify the backdrop resolution logic to prioritize the custom `backdropFilepath` from the config over the default `movie?.backdropUrl`. The fix needs to change the condition in `page.tsx` around line 119:

**Current logic (broken)**:
```typescript
let activeBackdropUrl = displayUrl || movie?.backdropUrl || '';
if (imageConfig?.backdropFilepath && !displayUrl) {
  // Apply custom backdrop only when displayUrl is empty
}
```

**Fixed logic**:
```typescript
let activeBackdropUrl = displayUrl || movie?.backdropUrl || '';
if (imageConfig?.backdropFilepath && currentScreenshotIndex === 0) {
  // Apply custom backdrop when showing index 0 (main backdrop)
  const backdropPath = imageConfig.backdropFilepath;
  activeBackdropUrl = `https://image.tmdb.org/t/p/original${backdropPath.startsWith('/') ? '' : '/'}${backdropPath}`;
}
```

This ensures that when viewing the main backdrop (index 0), the configured custom backdropFilepath takes priority over the default movie backdrop, while still allowing navigation to screenshots (indices 1+) which use the original logic.

**Files to modify**:
- `/Users/andrewle/Documents/Workspace/movie-rcmd-v4/apps/web/src/app/movies/[movieId]/page.tsx`

**Testing**:
1. Test with Blade Runner 2049 (TMDB ID: 335984) which has a configured backdropFilepath
2. Verify the custom backdrop appears when viewing index 0
3. Verify screenshot navigation still works for indices 1+
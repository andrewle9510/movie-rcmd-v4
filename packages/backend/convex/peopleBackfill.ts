// @ts-nocheck
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const backfillPeopleFromExistingMovies = action({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    delayMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;
    const delayMs = args.delayMs ?? 300;

    const movies = await ctx.runQuery(internal.movies.getAllMovies);
    const totalMovies = movies.length;

    const slice = movies.slice(offset, offset + limit);

    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ tmdbId: number; error: string }> = [];

    for (const movie of slice) {
      const tmdbId = movie.tmdb_id;
      try {
        const res = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveMovie, { tmdbId });
        if (res?.success) {
          succeeded++;
        } else {
          failed++;
          errors.push({ tmdbId, error: res?.error || res?.message || "Unknown error" });
        }
      } catch (e: any) {
        failed++;
        errors.push({ tmdbId, error: e?.message || "Unknown error" });
      }

      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }

    return {
      success: true,
      totalMovies,
      processed: slice.length,
      succeeded,
      failed,
      nextOffset: offset + slice.length,
      done: offset + slice.length >= totalMovies,
      errors,
    };
  },
});

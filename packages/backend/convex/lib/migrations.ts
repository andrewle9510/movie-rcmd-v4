// @ts-nocheck
import { internalMutation } from "../_generated/server";

export const migrateMovieImages = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Migration disabled - posters and backdrops fields removed
    return {
      success: true,
      message: "Migration deprecated.",
      totalMovies: 0,
    };
  },
});

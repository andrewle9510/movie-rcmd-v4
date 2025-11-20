import { internalMutation } from "./_generated/server";

export const migrateMovieImages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db.query("movies").collect();
    let updatedCount = 0;

    for (const movie of movies) {
      let needsUpdate = false;
      let newPosters: string[] | undefined = undefined;
      let newBackdrops: string[] | undefined = undefined;

      // Check and fix posters
      if (movie.posters && movie.posters.length > 0) {
        const firstPoster = movie.posters[0];
        if (typeof firstPoster === 'object' && firstPoster !== null && 'file_path' in (firstPoster as any)) {
          console.log(`Fixing posters for ${movie.title}`);
          newPosters = movie.posters.map((p: any) => p.file_path);
          needsUpdate = true;
        }
      }

      // Check and fix backdrops
      if (movie.backdrops && movie.backdrops.length > 0) {
        const firstBackdrop = movie.backdrops[0];
        if (typeof firstBackdrop === 'object' && firstBackdrop !== null && 'file_path' in (firstBackdrop as any)) {
          console.log(`Fixing backdrops for ${movie.title}`);
          newBackdrops = movie.backdrops.map((b: any) => b.file_path);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await ctx.db.patch(movie._id, {
          ...(newPosters ? { posters: newPosters } : {}),
          ...(newBackdrops ? { backdrops: newBackdrops } : {}),
        });
        updatedCount++;
      }
    }

    return {
      success: true,
      message: `Migration complete. Updated ${updatedCount} movies.`,
      totalMovies: movies.length,
    };
  },
});

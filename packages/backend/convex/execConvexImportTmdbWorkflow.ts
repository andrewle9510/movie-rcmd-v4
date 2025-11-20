import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { DbMovieStructure } from "./movieDataInterfaces";

// Direct import workflow: Fetch from TMDB and import directly to Convex database
export const runTmdbDirectImportWorkflow = action({
  args: {
    importType: v.optional(v.union(
      v.literal('single'),
      v.literal('popular'),
      v.literal('top_rated')
    )),
    tmdbId: v.optional(v.number()), // Required for single movie import
    limit: v.optional(v.number()), // Number of pages for bulk import
  },
  handler: async (ctx, args) => {
    const importType = args.importType || 'single';

    try {
      console.log(`Starting direct TMDB import workflow: ${importType}`);

      if (importType === 'single') {
        if (!args.tmdbId) throw new Error("tmdbId is required for single import");
        return await processSingleMovie(ctx, args.tmdbId);
      }

      // Bulk import logic
      const limit = args.limit || 1;
      const stats = {
        found: 0,
        skipped_existing: 0,
        imported: 0,
        failed: 0,
        pages_processed: 0
      };

      for (let page = 1; page <= limit; page++) {
        console.log(`Processing ${importType} page ${page}...`);
        
        // 1. Fetch List of IDs
        let fetchResult;
        if (importType === 'popular') {
          fetchResult = await ctx.runAction(internal.tmdbFetcher.fetchPopularMovieIds, { page });
        } else {
          fetchResult = await ctx.runAction(internal.tmdbFetcher.fetchTopRatedMovieIds, { page });
        }

        if (!fetchResult.success) {
           console.error(`Failed to fetch ${importType} page ${page}: ${fetchResult.error}`);
           continue;
        }

        const tmdbIds = fetchResult.ids;
        stats.found += tmdbIds.length;
        stats.pages_processed++;

        // 2. Check Existence in DB
        const existenceCheck = await ctx.runQuery(internal.dbImporter.checkMovieExistence, { tmdbIds });
        const existingIds = new Set(existenceCheck.existingIds || []);
        
        stats.skipped_existing += existingIds.size;

        // 3. Filter
        const idsToImport = tmdbIds.filter((id: number) => !existingIds.has(id));
        
        // 4. Process New Movies
        for (const id of idsToImport) {
          const result = await processSingleMovie(ctx, id);
          if (result.success) {
            stats.imported++;
          } else {
            stats.failed++;
          }
        }
      }

      return {
        success: true,
        importType,
        stats,
        message: `Bulk import completed. Found: ${stats.found}, Skipped: ${stats.skipped_existing}, Imported: ${stats.imported}, Failed: ${stats.failed}`
      };

    } catch (error) {
      console.error(`Error in direct TMDB import workflow: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to import ${importType}`
      };
    }
  }
});

async function processSingleMovie(ctx: any, tmdbId: number) {
  try {
      // Step 1: Fetch and normalize data using the shared fetcher (includes retries)
      const fetchResult = await ctx.runAction(internal.tmdbFetcher.fetchAndSaveMovie, {
        tmdbId
      });

      if (!fetchResult.success || !fetchResult.movieData) {
        throw new Error(fetchResult.error || fetchResult.message || "Failed to fetch movie data");
      }

      const dbStructureData = fetchResult.movieData.db_structure_data;

      // Step 2: Import directly to Convex database
      const importResult = await ctx.runMutation(internal.dbImporter.createMovieFromTmdbData, {
        title: dbStructureData.title,
        original_title: dbStructureData.original_title,
        slug: dbStructureData.slug,
        synopsis: dbStructureData.synopsis,
        tagline: dbStructureData.tagline,
        belong_to_collection: dbStructureData.belong_to_collection,
        popularity: dbStructureData.popularity,
        status: dbStructureData.status,
        release_date: dbStructureData.release_date,
        runtime_minutes: dbStructureData.runtime_minutes,
        directors: dbStructureData.directors,
        cast: dbStructureData.cast,
        production_studio: dbStructureData.production_studio,
        country: dbStructureData.country,
        genres: dbStructureData.genres,
        mood: dbStructureData.mood,
        keywords: dbStructureData.keywords,
        original_language: dbStructureData.original_language,
        language: dbStructureData.language,
        mpaa_rating: dbStructureData.mpaa_rating,
        vote_pts_system: dbStructureData.vote_pts_system,
        vote_count_system: dbStructureData.vote_count_system,
        budget: dbStructureData.budget,
        revenue: dbStructureData.revenue,
        tmdb_id: dbStructureData.tmdb_id,
        tmdb_data_imported_at: dbStructureData.tmdb_data_imported_at,
        imdb_id: dbStructureData.imdb_id,
        screenshots: dbStructureData.screenshots,
        trailer_url: dbStructureData.trailer_url,
        main_poster: dbStructureData.main_poster,
        main_backdrop: dbStructureData.main_backdrop,
        posters: dbStructureData.posters,
        backdrops: dbStructureData.backdrops,
        created_at: dbStructureData.created_at,
        updated_at: dbStructureData.updated_at,
      });

      return {
        success: true,
        tmdbId,
        importResult,
        message: `Successfully imported movie with TMDB ID: ${tmdbId} directly to Convex`
      };
  } catch (error) {
      console.error(`Error processing movie ${tmdbId}: ${error}`);
      return {
        success: false,
        tmdbId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to process movie ${tmdbId}`
      };
  }
}

// Action to validate that TMDB API key is configured properly
export const validateTmdbConfiguration = action({
  args: {},
  handler: async (ctx, args) => {
    try {
      // Check if TMDB_API_KEY is set in the environment
      const hasApiKey = !!process.env.TMDB_API_KEY;
      
      if (!hasApiKey) {
        return {
          success: false,
          message: "TMDB_API_KEY environment variable is not set",
          needsSetup: true
        };
      }
      
      // Test the API key by making a simple request
      try {
        const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${process.env.TMDB_API_KEY}`);
        if (response.ok) {
          return {
            success: true,
            message: "TMDB API configuration is valid",
            needsSetup: false
          };
        } else {
          return {
            success: false,
            message: `TMDB API configuration is invalid: ${response.status} - ${response.statusText}`,
            needsSetup: true
          };
        }
      } catch (fetchError) {
        return {
          success: false,
          message: `Failed to validate TMDB API configuration: ${fetchError}`,
          needsSetup: true
        };
      }
    } catch (error) {
      console.error(`Error validating TMDB configuration: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to validate TMDB configuration'
      };
    }
  }
});
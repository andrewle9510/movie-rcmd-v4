import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// This workflow orchestrates the complete TMDB import process:
// 1. Fetch data from TMDB API and save locally
// 2. Import local data to Convex database
// 3. Track progress and handle errors

export const runTmdbImportWorkflow = action({
  args: {
    importType: v.union(
      v.literal('single_movie'),
      v.literal('popular'),
      v.literal('top_rated'),
      v.literal('now_playing'),
      v.literal('all')
    ),
    tmdbId: v.optional(v.number()), // Required for 'single_movie'
    pages: v.optional(v.number()), // How many pages to fetch for multi-movie imports
  },
  handler: async (ctx, args) => {
    try {
      console.log(`Starting TMDB import workflow: ${args.importType}`);
      
      let result: any;
      
      switch (args.importType) {
        case 'single_movie':
          if (!args.tmdbId) {
            throw new Error("tmdbId is required for single_movie import");
          }
          
          // Step 1: Fetch and save the movie data
          console.log(`Step 1: Fetching movie with TMDB ID: ${args.tmdbId}`);
          result = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveMovie, {
            tmdbId: args.tmdbId
          });
          
          if (result.success) {
            // Step 2: Import to Convex
            console.log(`Step 2: Importing to Convex`);
            // Note: In a real implementation, you'd need a separate script or process
            // to read the local file and call importSingleTmdbMovie
            result.convexImport = {
              status: "READY_FOR_LOCAL_IMPORT",
              message: "Run local script to import: node scripts/tmdbWorkflow.js import-single " + args.tmdbId
            };
          }
          break;
          
        case 'popular':
          console.log(`Step 1: Fetching popular movies`);
          result = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSavePopularMovies, {
            limit: args.pages || 1
          });
          
          result.convexImport = {
            status: "READY_FOR_LOCAL_IMPORT",
            message: "Run local script to fetch and save: node scripts/tmdbWorkflow.js fetch-popular " + (args.pages || 1)
          };
          break;
          
        case 'top_rated':
          console.log(`Step 1: Fetching top rated movies`);
          result = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveTopRatedMovies, {
            limit: args.pages || 1
          });
          
          result.convexImport = {
            status: "READY_FOR_LOCAL_IMPORT",
            message: "Run local script to fetch and save: node scripts/tmdbWorkflow.js fetch-top-rated " + (args.pages || 1)
          };
          break;
          
        case 'now_playing':
          console.log(`Step 1: Fetching now playing movies`);
          result = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveNowPlayingMovies, {
            limit: args.pages || 1
          });
          
          result.convexImport = {
            status: "READY_FOR_LOCAL_IMPORT",
            message: "Run local script (not yet implemented for now_playing)"
          };
          break;
          
        case 'all':
          console.log('Step 1: Fetching genres');
          const genresResult = await ctx.runAction(internal.tmdbFetcher.fetchTmdbGenres, {});
          
          console.log('Step 2: Fetching various movie categories');
          const popularResult = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSavePopularMovies, {
            limit: args.pages || 1
          });
          
          const topRatedResult = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveTopRatedMovies, {
            limit: args.pages || 1
          });
          
          const nowPlayingResult = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveNowPlayingMovies, {
            limit: args.pages || 1
          });
          
          result = {
            genres: genresResult,
            popular: popularResult,
            top_rated: topRatedResult,
            now_playing: nowPlayingResult,
            message: "All categories fetched, run local import script to import to Convex"
          };
          break;
      }
      
      return {
        success: true,
        importType: args.importType,
        result,
        message: `TMDB import workflow completed for: ${args.importType}`
      };
    } catch (error) {
      console.error(`Error in TMDB import workflow: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to run TMDB import workflow: ${args.importType}`
      };
    }
  }
});

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

// Action to get current import progress
export const getImportProgress = action({
  args: {},
  handler: async (ctx, args) => {
    try {
      // Get stats from both local (simulated) and Convex
      const convexStats = await ctx.runAction(internal.dbImporter.getTmdbImportStats, {});
      
      // In a real implementation, this would read from local files to provide
      // both "to be imported" and "completed" counts
      return {
        success: true,
        convexStats: convexStats.success ? convexStats : null,
        localDataStatus: {
          status: "IMPLEMENTATION_NEEDED",
          message: "Run local script to scan for saved TMDB data files",
          nextSteps: [
            "Create a Node.js script to scan sample_data_structures/tmdb_movies/",
            "Count pending vs completed imports",
            "Show progress statistics"
          ]
        }
      };
    } catch (error) {
      console.error(`Error getting import progress: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get import progress'
      };
    }
  }
});
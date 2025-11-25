import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import type { DbMovieStructure } from "./movieDataInterfaces";

// Mutation to create a movie in the Convex database
export const createMovieFromTmdbData = mutation({
  args: {
    // All the normalized movie data fields (matching DbMovieStructure)
    title: v.string(),
    original_title: v.string(),
    slug: v.string(),
    synopsis: v.string(),
    tagline: v.string(),
    belong_to_collection: v.any(),
    popularity: v.number(),
    status: v.string(),
    release_date: v.string(),
    runtime_minutes: v.number(),
    directors: v.array(v.number()),
    cast: v.array(v.number()),
    production_studio: v.array(v.number()),
    country: v.array(v.string()),
    genres: v.array(v.number()),
    mood: v.array(v.number()),
    keywords: v.array(v.number()),
    original_language: v.string(),
    language: v.array(v.string()),
    mpaa_rating: v.string(),
    vote_pts_system: v.object({
      tmdb: v.number(),
      imdb: v.optional(v.union(v.number(), v.null())),
      letterboxd: v.optional(v.union(v.number(), v.null())),
      rotten_tomatoes: v.optional(v.union(v.number(), v.null())),
      metacritic: v.optional(v.union(v.number(), v.null()))
    }),
    vote_count_system: v.object({
      tmdb: v.number(),
      imdb: v.optional(v.union(v.number(), v.null())),
      letterboxd: v.optional(v.union(v.number(), v.null())),
      rotten_tomatoes: v.optional(v.union(v.number(), v.null())),
      metacritic: v.optional(v.union(v.number(), v.null()))
    }),
    budget: v.number(),
    revenue: v.number(),
    tmdb_id: v.number(),
    tmdb_data_imported_at: v.string(),
    imdb_id: v.string(),
    screenshots: v.array(v.string()),
    screenshot_id_list: v.optional(v.array(v.string())),
    screenshot_url: v.optional(v.string()),
    trailer_url: v.string(),
    main_poster: v.optional(v.union(v.string(), v.null())),
    main_backdrop: v.optional(v.union(v.string(), v.null())),
    created_at: v.string(),
    updated_at: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if movie with this tmdb_id already exists
    const existingMovie = await ctx.db
      .query("movies")
      .withIndex("by_tmdb_id", (q) => q.eq("tmdb_id", args.tmdb_id))
      .unique();

    // Clean up vote_count_system and vote_pts_system data to match schema (remove undefined values)
    const cleanedVoteCountSystem = {
      tmdb: args.vote_count_system.tmdb,
      imdb: args.vote_count_system.imdb ?? null,
      letterboxd: args.vote_count_system.letterboxd ?? null,
      metacritic: args.vote_count_system.metacritic ?? null,
      rotten_tomatoes: args.vote_count_system.rotten_tomatoes ?? null,
    };
    
    const cleanedVotePtsSystem = {
      tmdb: args.vote_pts_system.tmdb,
      imdb: args.vote_pts_system.imdb ?? null,
      letterboxd: args.vote_pts_system.letterboxd ?? null,
      metacritic: args.vote_pts_system.metacritic ?? null,
      rotten_tomatoes: args.vote_pts_system.rotten_tomatoes ?? null,
    };

    if (existingMovie) {
      // Update existing movie instead of creating duplicate
      const { vote_count_system, vote_pts_system, ...otherArgs } = args;
      
      await ctx.db.patch(existingMovie._id, {
        ...otherArgs,
        vote_count_system: cleanedVoteCountSystem,
        vote_pts_system: cleanedVotePtsSystem,
        updated_at: new Date().toISOString(),
      });
      
      return {
        success: true,
        movieId: existingMovie._id,
        updated: true,
        message: `Updated existing movie with TMDB ID: ${args.tmdb_id}`
      };
    }

    // Create new movie
    const movieId = await ctx.db.insert("movies", {
      ...args,
      vote_count_system: cleanedVoteCountSystem,
      vote_pts_system: cleanedVotePtsSystem,
      // Handle optional fields by providing defaults
      main_poster: args.main_poster ?? "",
      main_backdrop: args.main_backdrop ?? "",
      screenshots: args.screenshots ?? [],
      screenshot_id_list: args.screenshot_id_list ?? [],
      screenshot_url: args.screenshot_url ?? "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      movieId,
      updated: false,
      message: `Created new movie with TMDB ID: ${args.tmdb_id}`
    };
  }
});

// Action to import a single movie from local TMDB data storage
export const importSingleTmdbMovie = action({
  args: {
    tmdbId: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // In a real implementation, this would read from the specific JSON file
      // sample_data_structures/tmdb_movies/[args.tmdbId].json
      // Then call createMovieFromTmdbData with the normalized data
      
      // For now, return a message indicating the implementation needed
      return {
        success: true,
        message: `Would import movie with TMDB ID: ${args.tmdbId}`,
        details: {
          status: "IMPLEMENTATION_NEEDED",
          nextSteps: [
            "Read file: sample_data_structures/tmdb_movies/" + args.tmdbId + ".json",
            "Extract db_structure_data",
            "Call createMovieFromTmdbData",
            "Update import_status in local file to 'completed'"
          ]
        }
      };
    } catch (error) {
      console.error(`Error importing TMDB movie to Convex: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to import TMDB movie with ID: ${args.tmdbId}`
      };
    }
  }
});

// Action to check import status of TMDB data
export const checkTmdbImportStatus = action({
  args: {
    tmdbId: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // In a real implementation, this would read the import_status from the local file
      // For now, check if the movie exists in Convex
      const movie = await ctx.db
        .query("movies")
        .withIndex("by_tmdb_id", (q) => q.eq("tmdb_id", args.tmdbId))
        .unique();

      return {
        success: true,
        tmdbId: args.tmdbId,
        imported: !!movie,
        movieId: movie?._id,
        status: movie ? "completed" : "pending"
      };
    } catch (error) {
      console.error(`Error checking TMDB import status: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to check import status for TMDB ID: ${args.tmdbId}`
      };
    }
  }
});

// Query to check which movie IDs already exist in the database
export const checkMovieExistence = query({
  args: {
    tmdbIds: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const existingIds: number[] = [];
      
      // Since we can't do a single "in" query efficiently for a list of IDs in Convex yet
      // (unless we use a search index or complex logic), we will iterate.
      // For batches of 20 (page size), this is acceptable.
      for (const id of args.tmdbIds) {
         const movie = await ctx.db
          .query("movies")
          .withIndex("by_tmdb_id", (q) => q.eq("tmdb_id", id))
          .unique();
          
         if (movie) {
           existingIds.push(id);
         }
      }

      return {
        success: true,
        existingIds
      };
    } catch (error) {
      console.error(`Error checking movie existence: ${error}`);
      return {
        success: false,
        existingIds: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
});

// Internal mutation to get import statistics
export const getImportStatsInternal = mutation({
  args: {},
  handler: async (ctx, args) => {
    try {
      // Get statistics about imported movies
      const allMovies = await ctx.db.query("movies").collect();
      
       return {
         success: true,
         totalMovies: allMovies.length,
         stats: {
           totalInConvex: allMovies.length,
           firstMovieYear: allMovies.length > 0 
             ? Math.min(...allMovies.map(m => parseInt(m.release_date.split('-')[0]))) 
             : null,
           lastMovieYear: allMovies.length > 0 
             ? Math.max(...allMovies.map(m => parseInt(m.release_date.split('-')[0]))) 
             : null,
           genreCount: Array.from(new Set(allMovies.flatMap(m => m.genres))).length,
           averageRating: allMovies.length > 0
             ? allMovies.reduce((sum, m) => sum + m.vote_pts_system.tmdb, 0) / allMovies.length
             : 0
         }
       };
    } catch (error) {
      console.error(`Error getting TMDB import stats: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get import statistics'
      };
    }
  }
});

// Action to get import statistics
export const getTmdbImportStats = action({
  args: {},
  handler: async (ctx, args) => {
    try {
      // Call the internal mutation to get stats
      return await ctx.runMutation(internal.dbImporter.getImportStatsInternal, {});
    } catch (error) {
      console.error(`Error getting TMDB import stats: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get import statistics'
      };
    }
  }
});
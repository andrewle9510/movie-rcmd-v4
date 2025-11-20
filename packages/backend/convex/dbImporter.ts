import { action, mutation } from "./_generated/server";
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
    trailer_url: v.string(),
    main_poster: v.optional(v.string()),
    main_backdrop: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if movie with this tmdb_id already exists
    const existingMovie = await ctx.db
      .query("movies")
      .withIndex("by_tmdb_id", (q) => q.eq("tmdb_id", args.tmdb_id))
      .unique();

    if (existingMovie) {
      // Update existing movie instead of creating duplicate
      // Clean up vote_count_system data to match schema (remove undefined values)
      const { vote_count_system, vote_pts_system, ...otherArgs } = args;
      const cleanedVoteCountSystem = {
        tmdb: vote_count_system.tmdb,
        imdb: vote_count_system.imdb ?? null,
        letterboxd: vote_count_system.letterboxd ?? null,
        metacritic: vote_count_system.metacritic ?? null,
        rotten_tomatoes: vote_count_system.rotten_tomatoes ?? null,
      };
      
      const cleanedVotePtsSystem = {
        tmdb: vote_pts_system.tmdb,
        imdb: vote_pts_system.imdb ?? null,
        letterboxd: vote_pts_system.letterboxd ?? null,
        metacritic: vote_pts_system.metacritic ?? null,
        rotten_tomatoes: vote_pts_system.rotten_tomatoes ?? null,
      };
      
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
      // Handle optional fields by providing defaults
      main_poster: args.main_poster ?? "",
      main_backdrop: args.main_backdrop ?? "",
      screenshots: args.screenshots ?? [],
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
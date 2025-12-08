// @ts-nocheck
import { action, mutation, query } from "../../../_generated/server";
import { v } from "convex/values";
import { type Id } from "../../../_generated/dataModel";
import { internal } from "../../../_generated/api";
import type { DbMovieStructure } from "../movieDataInterfaces";

// Helper function to insert crew data (check existence first)
async function insertNewCrew(ctx: any, crewData: any[]) {
  for (const crew of crewData) {
    // Check if crew_id already exists
    const existingCrew = await ctx.db
      .query("crew")
      .withIndex("by_crew_id", (q: any) => q.eq("crew_id", crew.crew_id))
      .first();

    // Only insert if crew doesn't exist
    if (!existingCrew) {
      await ctx.db.insert("crew", {
        crew_id: crew.crew_id,
        crew_name: crew.crew_name,
        crew_type: crew.crew_type,
      });
    }
  }
}

// Mutation to create a movie in the Convex database
export const createMovieFromTmdbData = mutation({
  args: v.any(),
  handler: async (ctx: any, args: any) => {
    // Check if movie with this tmdb_id already exists
    // @ts-ignore
    // @ts-ignore
    const existingMovie = await ctx.db
      .query("movies")
      .withIndex("by_tmdb_id", (q: any) => q.eq("tmdb_id", args.tmdb_id))
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

    // Extract and insert crew data if provided
    const crewData = args.crew_data || [];
    if (crewData.length > 0) {
      await insertNewCrew(ctx, crewData);
    }

    if (existingMovie) {
      // Update existing movie instead of creating duplicate
      const { vote_count_system, vote_pts_system, crew_data, ...otherArgs } = args;

      await ctx.db.patch(existingMovie._id, {
        ...otherArgs,
        main_poster: otherArgs.main_poster ?? undefined,
        main_backdrop: otherArgs.main_backdrop ?? undefined,
        screenshot_id_list: otherArgs.screenshot_id_list ?? undefined,
        screenshot_url: otherArgs.screenshot_url ?? undefined,
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
    const { crew_data, ...movieArgs } = args;
    const movieId = await ctx.db.insert("movies", {
      ...movieArgs,
      vote_count_system: cleanedVoteCountSystem,
      vote_pts_system: cleanedVotePtsSystem,
      // Handle optional fields by providing defaults
      main_poster: movieArgs.main_poster ?? "",
      main_backdrop: movieArgs.main_backdrop ?? "",
      screenshots: movieArgs.screenshots ?? [],
      screenshot_id_list: movieArgs.screenshot_id_list ?? [],
      screenshot_url: movieArgs.screenshot_url ?? "",
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
              ? allMovies.reduce((sum, m) => sum + (m.vote_pts_system.tmdb || 0), 0) / allMovies.length
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
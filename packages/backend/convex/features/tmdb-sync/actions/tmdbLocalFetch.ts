// @ts-nocheck
import { action } from "../../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { fetchFromTmdb, transformTmdbMovieToDbStructure } from "./tmdbFetcher";

// Action to fetch and save a single movie from TMDB to local file
export const fetchAndSaveMovie = action({
  args: {
    tmdbId: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      console.log(`Fetching movie from TMDB with ID: ${args.tmdbId}`);
      
      // Fetch movie details from TMDB
      const tmdbMovie = await fetchFromTmdb(`/movie/${args.tmdbId}`, { 
        append_to_response: 'credits,videos,keywords,release_dates,images'
      });

      // Transform TMDB data to database structure
      const dbStructureData = await transformTmdbMovieToDbStructure(tmdbMovie);

      // Create the file structure 
      const movieData = {
        tmdb_id: args.tmdbId,
        original_tmdb_response: tmdbMovie,
        db_structure_data: dbStructureData,
        import_status: "pending" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // In a real implementation, you would save this to your local file system
      // For now, we'll just return the data structure
      return {
        success: true,
        tmdbId: args.tmdbId,
        movieData,
        message: `Successfully fetched and prepared movie data for TMDB ID: ${args.tmdbId}`
      };
    } catch (error) {
      console.error(`Error fetching movie from TMDB: ${error}`);
      return {
        success: false,
        tmdbId: args.tmdbId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to fetch movie with TMDB ID: ${args.tmdbId}`
      };
    }
  }
});

// Action to fetch popular movies from TMDB
export const fetchAndSavePopularMovies = action({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()), // How many pages to fetch (each page has 20 movies)
  },
  handler: async (ctx, args) => {
    try {
      const page = args.page || 1;
      const totalPages = args.limit || 1; // Default to just 1 page
      const results: any[] = [];
      let errors: any[] = [];

      // Fetch multiple pages if requested
      for (let i = page; i < page + totalPages; i++) {
        console.log(`Fetching popular movies page: ${i}`);
        
        const response = await fetchFromTmdb('/movie/popular', { page: i });
        const movies = response.results;
        
        for (const movie of movies) {
          try {
            const movieResult = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveMovie, {
              tmdbId: movie.id
            });
            
            if (movieResult.success) {
              results.push(movieResult);
            } else {
              errors.push(movieResult);
            }
          } catch (error) {
            errors.push({
              tmdbId: movie.id,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              message: `Failed to process movie with TMDB ID: ${movie.id}`
            });
          }
        }
      }

      return {
        success: true,
        totalPagesProcessed: totalPages,
        totalMoviesProcessed: results.length + errors.length,
        successfullyProcessed: results.length,
        errorCount: errors.length,
        results,
        errorDetails: errors
      };
    } catch (error) {
      console.error(`Error fetching popular movies from TMDB: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to fetch popular movies'
      };
    }
  }
});

// Action to fetch top rated movies from TMDB
export const fetchAndSaveTopRatedMovies = action({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()), // How many pages to fetch
  },
  handler: async (ctx, args) => {
    try {
      const page = args.page || 1;
      const totalPages = args.limit || 1; // Default to just 1 page
      const results: any[] = [];
      let errors: any[] = [];

      // Fetch multiple pages if requested
      for (let i = page; i < page + totalPages; i++) {
        console.log(`Fetching top rated movies page: ${i}`);
        
        const response = await fetchFromTmdb('/movie/top_rated', { page: i });
        const movies = response.results;
        
        for (const movie of movies) {
          try {
            const movieResult = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveMovie, {
              tmdbId: movie.id
            });
            
            if (movieResult.success) {
              results.push(movieResult);
            } else {
              errors.push(movieResult);
            }
          } catch (error) {
            errors.push({
              tmdbId: movie.id,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              message: `Failed to process movie with TMDB ID: ${movie.id}`
            });
          }
        }
      }

      return {
        success: true,
        totalPagesProcessed: totalPages,
        totalMoviesProcessed: results.length + errors.length,
        successfullyProcessed: results.length,
        errorCount: errors.length,
        results,
        errorDetails: errors
      };
    } catch (error) {
      console.error(`Error fetching top rated movies from TMDB: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to fetch top rated movies'
      };
    }
  }
});

// Action to fetch now playing movies from TMDB
export const fetchAndSaveNowPlayingMovies = action({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()), // How many pages to fetch
  },
  handler: async (ctx, args) => {
    try {
      const page = args.page || 1;
      const totalPages = args.limit || 1; // Default to just 1 page
      const results: any[] = [];
      let errors: any[] = [];

      // Fetch multiple pages if requested
      for (let i = page; i < page + totalPages; i++) {
        console.log(`Fetching now playing movies page: ${i}`);
        
        const response = await fetchFromTmdb('/movie/now_playing', { page: i });
        const movies = response.results;
        
        for (const movie of movies) {
          try {
            const movieResult = await ctx.runAction(internal.tmdbLocalFetch.fetchAndSaveMovie, {
              tmdbId: movie.id
            });
            
            if (movieResult.success) {
              results.push(movieResult);
            } else {
              errors.push(movieResult);
            }
          } catch (error) {
            errors.push({
              tmdbId: movie.id,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              message: `Failed to process movie with TMDB ID: ${movie.id}`
            });
          }
        }
      }

      return {
        success: true,
        totalPagesProcessed: totalPages,
        totalMoviesProcessed: results.length + errors.length,
        successfullyProcessed: results.length,
        errorCount: errors.length,
        results,
        errorDetails: errors
      };
    } catch (error) {
      console.error(`Error fetching now playing movies from TMDB: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to fetch now playing movies'
      };
    }
  }
});

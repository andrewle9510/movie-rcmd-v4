import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { DbMovieStructure } from "./movieDataInterfaces";

// Direct import workflow: Fetch from TMDB and import directly to Convex database
export const runTmdbDirectImportWorkflow = action({
  args: {
    tmdbId: v.number(), // Required for single movie import
  },
  handler: async (ctx, args) => {
    try {
      console.log(`Starting direct TMDB import for movie ID: ${args.tmdbId}`);
      
      // Fetch movie details from TMDB API
      const tmdbApiKey = process.env.TMDB_API_KEY;
      if (!tmdbApiKey) {
        throw new Error("TMDB_API_KEY environment variable is not set");
      }

      // Fetch movie details with additional data
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${args.tmdbId}?api_key=${tmdbApiKey}&append_to_response=credits,videos,keywords,release_dates`
      );
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} - ${response.statusText}`);
      }

      const movieDetails = await response.json();

      // Transform TMDB data to database structure
      const directors = movieDetails.credits?.crew
        .filter((person: any) => person.job === 'Director')
        .map((director: any) => director.id) || [];

      // Extract top cast members (first 10)
      const cast = movieDetails.credits?.cast
        .sort((a: any, b: any) => a.order - b.order)
        .slice(0, 10)
        .map((actor: any) => actor.id) || [];

      // Extract production studios
      const production_studio = movieDetails.production_companies?.map((company: any) => company.id) || [];

      // Extract countries
      const country = movieDetails.production_countries?.map((country: any) => country.name) || [];

      // Extract languages
      const languages = movieDetails.spoken_languages?.map((lang: any) => lang.english_name) || [];

      // Extract genres
      const genres = movieDetails.genres?.map((genre: any) => genre.id) || [];

      // Extract keywords
      const keywords = movieDetails.keywords?.keywords?.map((keyword: any) => keyword.id) || [];

      // Extract MPAA rating from release dates
      let mpaa_rating = '';
      if (movieDetails.release_dates?.results) {
        const usRelease = movieDetails.release_dates.results.find((release: any) => release.iso_3166_1 === 'US');
        if (usRelease && usRelease.release_dates.length > 0) {
          const firstRelease = usRelease.release_dates[0];
          mpaa_rating = firstRelease.certification || '';
        }
      }

      // Extract trailer URL if available
      const trailer = movieDetails.videos?.results?.find((video: any) => 
        video.type === 'Trailer' && video.site === 'YouTube'
      );

      // Prepare the database structure
      const dbMovieStructure: DbMovieStructure = {
        title: movieDetails.title,
        original_title: movieDetails.original_title,
        slug: movieDetails.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        synopsis: movieDetails.overview || '',
        tagline: movieDetails.tagline || '',
        belong_to_collection: movieDetails.belongs_to_collection || null,
        popularity: movieDetails.popularity || 0,
        status: movieDetails.status || '',
        release_date: movieDetails.release_date || '',
        runtime_minutes: movieDetails.runtime || 0,
        directors,
        cast,
        production_studio,
        country,
        genres,
        mood: [], // For now, can be populated later based on genres or other factors
        keywords,
        original_language: languages[0] || 'English',
        language: languages,
        mpaa_rating,
        vote_pts_system: {
          tmdb: movieDetails.vote_average || 0,
          imdb: null, // Would need to fetch from OMDB or another source
          letterboxd: null, // Not available from TMDB
          rotten_tomatoes: null, // Not available from TMDB
          metacritic: null // Not available from TMDB
        },
        vote_count_system: {
          tmdb: movieDetails.vote_count || 0,
          imdb: null,
          letterboxd: null,
          rotten_tomatoes: null,
          metacritic: null
        },
        budget: movieDetails.budget || 0,
        revenue: movieDetails.revenue || 0,
        tmdb_id: movieDetails.id,
        tmdb_data_imported_at: new Date().toISOString(),
        imdb_id: movieDetails.imdb_id || '',
        screenshots: [], // TMDB doesn't provide screenshots directly
        trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
        main_poster: movieDetails.poster_path,
        main_backdrop: movieDetails.backdrop_path,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Import directly to Convex database
      const importResult = await ctx.runMutation(internal.dbImporter.createMovieFromTmdbData, {
        title: dbMovieStructure.title,
        original_title: dbMovieStructure.original_title,
        slug: dbMovieStructure.slug,
        synopsis: dbMovieStructure.synopsis,
        tagline: dbMovieStructure.tagline,
        belong_to_collection: dbMovieStructure.belong_to_collection,
        popularity: dbMovieStructure.popularity,
        status: dbMovieStructure.status,
        release_date: dbMovieStructure.release_date,
        runtime_minutes: dbMovieStructure.runtime_minutes,
        directors: dbMovieStructure.directors,
        cast: dbMovieStructure.cast,
        production_studio: dbMovieStructure.production_studio,
        country: dbMovieStructure.country,
        genres: dbMovieStructure.genres,
        mood: dbMovieStructure.mood,
        keywords: dbMovieStructure.keywords,
        original_language: dbMovieStructure.original_language,
        language: dbMovieStructure.language,
        mpaa_rating: dbMovieStructure.mpaa_rating,
        vote_pts_system: dbMovieStructure.vote_pts_system,
        vote_count_system: dbMovieStructure.vote_count_system,
        budget: dbMovieStructure.budget,
        revenue: dbMovieStructure.revenue,
        tmdb_id: dbMovieStructure.tmdb_id,
        tmdb_data_imported_at: dbMovieStructure.tmdb_data_imported_at,
        imdb_id: dbMovieStructure.imdb_id,
        screenshots: dbMovieStructure.screenshots,
        trailer_url: dbMovieStructure.trailer_url,
        main_poster: dbMovieStructure.main_poster,
        main_backdrop: dbMovieStructure.main_backdrop,
        created_at: dbMovieStructure.created_at,
        updated_at: dbMovieStructure.updated_at,
      });

      return {
        success: true,
        tmdbId: args.tmdbId,
        importResult,
        message: `Successfully imported movie with TMDB ID: ${args.tmdbId} directly to Convex`
      };

    } catch (error) {
      console.error(`Error in direct TMDB import workflow: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to import movie with TMDB ID: ${args.tmdbId}`
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
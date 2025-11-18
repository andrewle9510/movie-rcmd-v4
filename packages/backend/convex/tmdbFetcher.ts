import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { TmdbMovieResponse, DbMovieStructure } from "./movieDataInterfaces";

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchFromTmdb(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY environment variable is not set");
  }

  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} - ${response.statusText}`);
  }

  return await response.json();
}

async function transformTmdbMovieToDbStructure(movie: TmdbMovieResponse): Promise<DbMovieStructure> {
  // Get extended movie details (with credits)
  const movieDetails = await fetchFromTmdb(`/movie/${movie.id}`, { append_to_response: 'credits,videos,keywords,release_dates' });
  
  // Extract directors from crew
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
      // Typically the first release date is the theatrical release
      const firstRelease = usRelease.release_dates[0];
      mpaa_rating = firstRelease.certification || '';
    }
  }

  // Extract trailer URL if available
  const trailer = movieDetails.videos?.results?.find((video: any) => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  return {
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
}

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
        append_to_response: 'credits,videos,keywords,release_dates'
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
            const movieResult = await ctx.runAction(internal.tmdbFetcher.fetchAndSaveMovie, {
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
            const movieResult = await ctx.runAction(internal.tmdbFetcher.fetchAndSaveMovie, {
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
            const movieResult = await ctx.runAction(internal.tmdbFetcher.fetchAndSaveMovie, {
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

// Action to get available TMDB genres
export const fetchTmdbGenres = action({
  args: {},
  handler: async (ctx, args) => {
    try {
      console.log('Fetching TMDB genres');
      
      const genres = await fetchFromTmdb('/genre/movie/list');
      
      // Save genres to local file for reference
      const genresData = {
        genres: genres.genres,
        fetched_at: new Date().toISOString()
      };

      return {
        success: true,
        genres: genres.genres,
        message: 'Successfully fetched TMDB genres'
      };
    } catch (error) {
      console.error(`Error fetching TMDB genres: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to fetch TMDB genres'
      };
    }
  }
});
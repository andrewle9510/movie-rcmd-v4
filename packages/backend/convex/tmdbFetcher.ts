import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { TmdbMovieResponse, DbMovieStructure } from "./movieDataInterfaces";

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchFromTmdb(endpoint: string, params: Record<string, any> = {}, retries = 3): Promise<any> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY environment variable is not set");
  }

  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params
  });

  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);
      
      if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * Math.pow(2, i);
        console.log(`Rate limited. Retrying after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        // Don't retry on 4xx errors (except 429) as they are likely client errors
        if (response.status >= 400 && response.status < 500) {
           throw new Error(`TMDB API error: ${response.status} - ${response.statusText}`);
        }
        throw new Error(`TMDB API error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      // Don't retry if it's a client error that we threw above
      if (error instanceof Error && error.message.includes('TMDB API error: 4')) {
         throw error;
      }
      
      if (i < retries) {
        const waitTime = 1000 * Math.pow(2, i);
        console.warn(`Attempt ${i + 1} failed. Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error("Failed to fetch from TMDB after retries");
}

// Helper to just fetch the list of IDs for bulk operations
export const fetchPopularMovieIds = action({
  args: {
    page: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetchFromTmdb('/movie/popular', { page: args.page });
      const movies = response.results || [];
      
      return {
        success: true,
        ids: movies.map((m: any) => m.id),
        page: args.page,
        total_pages: response.total_pages
      };
    } catch (error) {
      console.error(`Error fetching popular movie IDs: ${error}`);
      return {
        success: false,
        ids: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

export const fetchTopRatedMovieIds = action({
  args: {
    page: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetchFromTmdb('/movie/top_rated', { page: args.page });
      const movies = response.results || [];
      
      return {
        success: true,
        ids: movies.map((m: any) => m.id),
        page: args.page,
        total_pages: response.total_pages
      };
    } catch (error) {
      console.error(`Error fetching top rated movie IDs: ${error}`);
      return {
        success: false,
        ids: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

async function transformTmdbMovieToDbStructure(movie: TmdbMovieResponse): Promise<DbMovieStructure> {
  // Get extended movie details (with credits, images)
  const movieDetails = await fetchFromTmdb(`/movie/${movie.id}`, { append_to_response: 'credits,videos,keywords,release_dates,images' });
  
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

  // Process images - get top 10 posters and top 30 backdrops (default TMDB order)
  const posters = (movieDetails.images?.posters || [])
    .slice(0, 10)
    .map((image: any) => image.file_path);

  const backdrops = (movieDetails.images?.backdrops || [])
    .slice(0, 30)
    .map((image: any) => image.file_path);

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
    posters,
    backdrops,
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

// Action to update all existing movies in the database with fresh data from TMDB
export const updateExistingMovies = action({
  args: {},
  handler: async (ctx) => {
    try {
      console.log('Starting update of all existing movies...');
      
      // Get all movies from the database
      const movies = await ctx.runQuery(internal.movies.getAllMovies);
      console.log(`Found ${movies.length} movies to update.`);
      
      let updatedCount = 0;
      let failedCount = 0;
      const errors: any[] = [];
      
      // Iterate and update each movie
      for (const movie of movies) {
        console.log(`Updating movie: ${movie.title} (ID: ${movie._id}, TMDB ID: ${movie.tmdb_id})`);
        
        try {
          const result = await ctx.runAction(internal.tmdbFetcher.fetchAndSaveMovie, {
            tmdbId: movie.tmdb_id
          });
          
          if (result.success && result.movieData) {
            const dbData = result.movieData.db_structure_data;
            
            console.log(`Data ready for ${movie.title} - Posters: ${dbData.posters?.length || 0}, Backdrops: ${dbData.backdrops?.length || 0}`);

            // Save the data to the database
            await ctx.runMutation(internal.movies.updateMovie, {
              id: movie._id,
              // Update fields that might have changed
              popularity: dbData.popularity,
              vote_count_system: dbData.vote_count_system,
              vote_pts_system: dbData.vote_pts_system,
              posters: dbData.posters,
              backdrops: dbData.backdrops,
              tmdb_data_imported_at: new Date().toISOString(),
              main_poster: dbData.main_poster,
              main_backdrop: dbData.main_backdrop
            });

            updatedCount++;
            console.log(`Successfully updated: ${movie.title}`);
          } else {
            failedCount++;
            console.error(`Failed to fetch data for: ${movie.title} - ${result.message}`);
            errors.push({
              id: movie._id,
              title: movie.title,
              error: result.message
            });
          }
        } catch (err) {
          failedCount++;
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Exception updating ${movie.title}: ${errorMessage}`);
          errors.push({
            id: movie._id,
            title: movie.title,
            error: errorMessage
          });
        }
      }
      
      return {
        success: true,
        total: movies.length,
        updated: updatedCount,
        failed: failedCount,
        errors,
        message: `Update complete. Updated ${updatedCount}/${movies.length} movies.`
      };
    } catch (error) {
      console.error(`Error in updateExistingMovies: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to execute update workflow'
      };
    }
  }
});
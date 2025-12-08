// @ts-nocheck
import { query, mutation, internalQuery } from "../../../_generated/server";
import { v } from "convex/values";
import { type Id } from "../../../_generated/dataModel";

// Internal query to get all movies (for maintenance tasks)
export const getAllMovies = internalQuery({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db.query("movies").collect();
    return movies.map(movie => ({
      _id: movie._id,
      tmdb_id: movie.tmdb_id,
      title: movie.title
    }));
  },
});

// Get a specific movie by ID
export const getMovie = query({
  args: {
    id: v.id("movies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get a specific movie by TMDB ID
export const getMovieByTmdbId = query({
  args: {
    tmdbId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .withIndex("by_tmdb_id", (q) => q.eq("tmdb_id", args.tmdbId))
      .first();
  },
});

// Search movies by various criteria
export const searchMovies = query({
  args: {
    title: v.optional(v.string()),
    genres: v.optional(v.array(v.number())),
    releaseYear: v.optional(v.number()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("movies");
    
    if (args.title) {
      query = query.withSearchIndex("by_title", args.title!);
    }
    
    // If filtering by release year, we need to filter after fetching
    if (args.releaseYear) {
      const allMovies = await query.collect();
      return allMovies
        .filter(movie => 
          movie.release_date && 
          parseInt(movie.release_date.split('-')[0]) === args.releaseYear
        )
        .slice(args.offset || 0, (args.offset || 0) + (args.limit || 20));
    }
    
    if (args.genres && args.genres.length > 0) {
      // Filter by genres after fetching
      const allMovies = await query.collect();
      return allMovies.filter(movie => 
        args.genres!.some(genre => movie.genres.includes(genre))
      ).slice(args.offset || 0, (args.offset || 0) + (args.limit || 20));
    }
    
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    
    return await query.order("desc").paginate(offset, limit);
  },
});

// Get movies by category (trending, popular, etc.)
export const getMoviesByCategory = query({
  args: {
    category: v.string(), // 'trending', 'popular', 'top_rated', 'newly_released'
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    switch (args.category) {
      case 'trending':
        // For now, return latest movies - in real implementation, this could use watch count or recent activity
        return await ctx.db.query("movies")
          .order("desc")
          .take(limit);
      case 'popular':
        // Return movies with highest TMDB vote count
        return await ctx.db.query("movies")
          .order("desc", { field: "vote_count_system.tmdb" })
          .take(limit);
      case 'top_rated':
        // Return movies with highest TMDB rating
        return await ctx.db.query("movies")
          .order("desc", { field: "vote_pts_system.tmdb" })
          .take(limit);
       case 'newly_released':
         return await ctx.db.query("movies")
           .order("desc", { field: "release_date" })
           .take(limit);
      default:
        return await ctx.db.query("movies")
          .order("desc")
          .take(limit);
    }
  },
});

// Get movies by specific crew members (director, cast, etc.)
export const getMoviesByCrew = query({
  args: {
    crewId: v.number(), // This is a director, cast member, or studio ID from TMDB
  },
  handler: async (ctx, args) => {
    const allMovies = await ctx.db.query("movies").collect();
    return allMovies.filter(movie => 
      movie.directors.includes(args.crewId) || 
      movie.cast.includes(args.crewId) || 
      movie.production_studio.includes(args.crewId)
    );
  },
});

// Create a new movie (typically used for importing from TMDB)
export const createMovie = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("movies", {
      ...args,
      main_poster: args.main_poster ?? "",
      main_backdrop: args.main_backdrop ?? "",
      screenshot_id_list: args.screenshot_id_list ?? [],
      screenshot_url: args.screenshot_url ?? "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },
});

  // Update an existing movie
  export const updateMovie = mutation({
    args: {
      id: v.id("movies"),
      title: v.optional(v.string()),
      original_title: v.optional(v.string()),
      slug: v.optional(v.string()),
      synopsis: v.optional(v.string()),
      tagline: v.optional(v.string()),
      belong_to_collection: v.optional(v.any()),
      popularity: v.optional(v.number()),
      status: v.optional(v.string()),
      release_date: v.optional(v.string()),
      runtime_minutes: v.optional(v.number()),
      directors: v.optional(v.array(v.number())),
      cast: v.optional(v.array(v.number())),
      production_studio: v.optional(v.array(v.number())),
      country: v.optional(v.array(v.string())),
      genres: v.optional(v.array(v.number())),
      mood: v.optional(v.array(v.number())),
      keywords: v.optional(v.array(v.number())),
      original_language: v.optional(v.string()),
      language: v.optional(v.array(v.string())),
      mpaa_rating: v.optional(v.string()),
      vote_pts_system: v.optional(v.object({
        tmdb: v.number(),
        imdb: v.optional(v.union(v.number(), v.null())),
        letterboxd: v.optional(v.union(v.number(), v.null())),
        rotten_tomatoes: v.optional(v.union(v.number(), v.null())),
        metacritic: v.optional(v.union(v.number(), v.null()))
      })),
      vote_count_system: v.optional(v.object({
        tmdb: v.number(),
        imdb: v.optional(v.union(v.number(), v.null())),
        letterboxd: v.optional(v.union(v.number(), v.null())),
        rotten_tomatoes: v.optional(v.union(v.number(), v.null())),
        metacritic: v.optional(v.union(v.number(), v.null()))
      })),
      budget: v.optional(v.number()),
      revenue: v.optional(v.number()),
      tmdb_id: v.optional(v.number()),
      tmdb_data_imported_at: v.optional(v.string()),
      imdb_id: v.optional(v.string()),
      screenshots: v.optional(v.array(v.string())),
      screenshot_id_list: v.optional(v.array(v.string())),
      screenshot_url: v.optional(v.string()),
      trailer_url: v.optional(v.string()),
      main_poster: v.optional(v.union(v.string(), v.null())),
      main_backdrop: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
      const { id, ...updateFields } = args;
      
      // Only update fields that were provided
      const movie = await ctx.db.get(id);
      if (!movie) {
        throw new Error("Movie not found");
      }
      
      // Construct the update object with only the fields that are defined
      const updates = {
        ...Object.fromEntries(
          Object.entries(updateFields).filter(([_, value]) => value !== undefined)
        ),
        updated_at: new Date().toISOString(),
      };
      
      return await ctx.db.patch(id, updates);
    },
  });

  // Get all movies (public query version)
  export const getMovies = query({
    handler: async (ctx) => {
      return await ctx.db.query("movies").collect();
    },
  });

  // Get movies with pagination
  export const getMoviesPaginated = query({
    args: { 
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const limit = args.limit || 20;
      const offset = args.offset || 0;
      
      const allMovies = await ctx.db.query("movies").collect();
      return allMovies.slice(offset, offset + limit);
    },
  });

  // Get featured movies (top rated)
  export const getFeaturedMovies = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
      const limit = args.limit || 10;
      const movies = await ctx.db.query("movies").collect();
      
      // Sort by TMDB rating
      const sorted = movies.sort((a, b) => {
        const ratingA = a.vote_pts_system.tmdb || 0;
        const ratingB = b.vote_pts_system.tmdb || 0;
        return ratingB - ratingA;
      });
      
      return sorted.slice(0, limit);
    },
  });

  // Get trending movies (by popularity)
  export const getTrendingMovies = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
      const limit = args.limit || 10;
      const movies = await ctx.db.query("movies").collect();
      
      // Sort by popularity
      const sorted = movies.sort((a, b) => b.popularity - a.popularity);
      
      return sorted.slice(0, limit);
    },
  });

  // Get new releases
  export const getNewReleases = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
      const limit = args.limit || 10;
      const movies = await ctx.db.query("movies").collect();
      
      // Sort by release date (newest first)
      const sorted = movies.sort((a, b) => {
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      });
      
      return sorted.slice(0, limit);
    },
  });

  // Get movie by slug
  export const getMovieBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
      const movies = await ctx.db.query("movies").collect();
      return movies.find(m => m.slug === args.slug);
    },
  });

  // Get movies by genre
  export const getMoviesByGenre = query({
    args: { 
      genreId: v.number(),
      limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const limit = args.limit || 20;
      const movies = await ctx.db.query("movies").collect();
      
      const filtered = movies.filter(movie => 
        movie.genres.includes(args.genreId)
      );
      
      return filtered.slice(0, limit);
    },
  });

  // Get movies data version for cache management
  export const getMoviesDataVersion = query({
    handler: async (ctx) => {
      // Get total count of movies first
      const allMovies = await ctx.db.query("movies").collect();
      const totalMovies = allMovies.length;
      
      // Only try to get latest movie if there are movies
      let latestMovie = null;
      if (totalMovies > 0) {
        latestMovie = await ctx.db.query("movies")
          .order("desc", { field: "updated_at" })
          .first();
      }
      
      return {
        moviesDataVersion: latestMovie?.updated_at || new Date().toISOString(),
        totalMovies
      };
    }
  });

  // Get crew members by IDs
  export const getCrewByIds = query({
    args: {
      crewIds: v.array(v.number()),
    },
    handler: async (ctx, args) => {
      if (!args.crewIds || args.crewIds.length === 0) {
        return [];
      }

      const allCrew = await ctx.db.query("crew").collect();
      
      // Return empty array if crew table is empty
      if (allCrew.length === 0) {
        return [];
      }
      
      return allCrew.filter(crew => args.crewIds.includes(crew.crew_id));
    },
  });
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Health check
export const healthCheck = query({
  handler: async (ctx) => {
    const movieCount = await ctx.db.query("movies").collect().then(movies => movies.length);
    return movieCount > 0 ? "OK" : "NO_MOVIES";
  },
});

// Get all movies
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

// Get movie by ID
export const getMovie = query({
  args: { id: v.id("movies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get movie by TMDB ID
export const getMovieByTmdbId = query({
  args: { tmdbId: v.number() },
  handler: async (ctx, args) => {
    const movies = await ctx.db.query("movies").collect();
    return movies.find(m => m.tmdb_id === args.tmdbId);
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

// Search movies
export const searchMovies = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const movies = await ctx.db.query("movies").collect();
    const searchTerm = args.query.toLowerCase();
    
    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.original_title.toLowerCase().includes(searchTerm) ||
      movie.synopsis.toLowerCase().includes(searchTerm) ||
      movie.tagline.toLowerCase().includes(searchTerm)
    );
    
    return filtered.slice(0, limit);
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

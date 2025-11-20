import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  movies: defineTable({
    title: v.string(),
    tmdb_id: v.number(),
    imdb_id: v.string(),
    slug: v.string(),
    original_title: v.string(),
    original_language: v.string(),
    synopsis: v.string(),
    tagline: v.string(),
    status: v.string(),
    release_date: v.string(),
    runtime_minutes: v.number(),
    budget: v.number(),
    revenue: v.number(),
    popularity: v.number(),
    mpaa_rating: v.string(),
    main_poster: v.string(),
    main_backdrop: v.string(),
    posters: v.optional(v.array(v.string())),
    backdrops: v.optional(v.array(v.string())),
    screenshots: v.array(v.any()),
    trailer_url: v.string(),
    cast: v.array(v.number()),
    directors: v.array(v.number()),
    genres: v.array(v.number()),
    keywords: v.array(v.number()),
    production_studio: v.array(v.number()),
    country: v.array(v.string()),
    language: v.array(v.string()),
    mood: v.array(v.any()),
    belong_to_collection: v.union(
      v.object({
        backdrop_path: v.string(),
        id: v.number(),
        name: v.string(),
        poster_path: v.string(),
      }),
      v.null()
    ),
    vote_count_system: v.object({
      imdb: v.union(v.number(), v.null()),
      letterboxd: v.union(v.number(), v.null()),
      metacritic: v.union(v.number(), v.null()),
      rotten_tomatoes: v.union(v.number(), v.null()),
      tmdb: v.union(v.number(), v.null()),
    }),
    vote_pts_system: v.object({
      imdb: v.union(v.number(), v.null()),
      letterboxd: v.union(v.number(), v.null()),
      metacritic: v.union(v.number(), v.null()),
      rotten_tomatoes: v.union(v.number(), v.null()),
      tmdb: v.union(v.number(), v.null()),
    }),
    created_at: v.string(),
    updated_at: v.string(),
    tmdb_data_imported_at: v.string(),
  })
    .index("by_tmdb_id", ["tmdb_id"])
    .index("by_slug", ["slug"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
  }),

  watchlist: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    addedAt: v.number(),
  }),

  ratings: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    rating: v.number(),
    review: v.optional(v.string()),
    createdAt: v.number(),
  }),

  user_movie_lists: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    listType: v.string(),
    addedAt: v.number(),
  }),

  user_events: defineTable({
    userId: v.id("users"),
    eventType: v.string(),
    eventData: v.any(),
    createdAt: v.number(),
  }),
});

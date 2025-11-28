// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel";

// Get all user movie list records (useful for analytics or admin functions)
export const getAllUserMovieLists = query({
  args: {
    userId: v.optional(v.id("users")),
    movieId: v.optional(v.id("movies")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db.query("user_movie_lists");
    
    if (args.userId) {
      queryBuilder = queryBuilder.withIndex("user_id", q => q.eq("user_id", args.userId!));
    }
    
    if (args.movieId) {
      if (args.userId) {
        // If userId was already specified, use the compound index
        queryBuilder = queryBuilder.withIndex("user_id_movie_id", q => 
          q.eq("user_id", args.userId!).eq("movie_id", args.movieId!)
        );
      } else {
        // If only movieId is specified
        queryBuilder = queryBuilder.withIndex("movie_id", q => q.eq("movie_id", args.movieId!));
      }
    }
    
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    
    return await queryBuilder.order("desc").paginate(offset, limit);
  },
});

// Get a specific user-movie interaction record
export const getUserMovieRecord = query({
  args: {
    userId: v.id("users"),
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_movie_lists")
      .withIndex("user_id_movie_id", q => 
        q.eq("user_id", args.userId).eq("movie_id", args.movieId)
      )
      .unique();
  },
});

// Delete a user-movie interaction record
export const deleteUserMovieRecord = mutation({
  args: {
    userId: v.id("users"),
    movieId: v.id("movies"),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("user_movie_lists")
      .withIndex("user_id_movie_id", q => 
        q.eq("user_id", args.userId).eq("movie_id", args.movieId)
      )
      .unique();
    
    if (record) {
      await ctx.db.delete(record._id);
      return { success: true };
    } else {
      return { success: false, message: "Record not found" };
    }
  },
});

// Update user movie list record directly (more granular control than updateUserMovieStatus)
export const updateUserMovieRecord = mutation({
  args: {
    userId: v.id("users"),
    movieId: v.id("movies"),
    watchlist: v.optional(v.union(v.object({
      added_at: v.string(), // ISO timestamp
      order: v.optional(v.number())
    }), v.null())),
    watched: v.optional(v.union(v.object({
      first_watched_at: v.string(), // ISO timestamp
      last_watched_at: v.string(), // ISO timestamp
      watch_count: v.number()
    }), v.null())),
    ignored: v.optional(v.union(v.object({
      added_at: v.string(), // ISO timestamp
      reason: v.optional(v.string())
    }), v.null())),
    rating: v.optional(v.union(v.object({
      score: v.number(),
      scale: v.number(),
      rated_at: v.string() // ISO timestamp
    }), v.null())),
    comments: v.optional(v.array(v.object({
      comment: v.string(),
      created_at: v.string() // ISO timestamp
    }))),
    tags: v.optional(v.array(v.string())),
    spoiler: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, movieId, ...updateFields } = args;
    
    // Get existing record
    const existingRecord = await ctx.db
      .query("user_movie_lists")
      .withIndex("user_id_movie_id", q => 
        q.eq("user_id", userId).eq("movie_id", movieId)
      )
      .unique();
    
    if (!existingRecord) {
      throw new Error("User movie list record not found");
    }
    
    // Prepare update data by merging existing record with new values
    const updateData: any = { ...existingRecord };
    
    // Update only specified fields
    Object.entries(updateFields).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });
    
    // Update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Perform the patch operation
    await ctx.db.patch(existingRecord._id, updateData);
    
    // Return the updated record
    return await ctx.db.get(existingRecord._id);
  },
});

// Add a comment to a movie for a specific user
export const addCommentToMovie = mutation({
  args: {
    userId: v.id("users"),
    movieId: v.id("movies"),
    comment: v.string(),
    spoiler: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("user_movie_lists")
      .withIndex("user_id_movie_id", q => 
        q.eq("user_id", args.userId).eq("movie_id", args.movieId)
      )
      .unique();
    
    if (!record) {
      // If no record exists, create a new one with the comment
      const newRecordId = await ctx.db.insert("user_movie_lists", {
        user_id: args.userId,
        movie_id: args.movieId,
        comments: [{
          comment: args.comment,
          created_at: new Date().toISOString()
        }],
        spoiler: args.spoiler || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return await ctx.db.get(newRecordId);
    }
    
    // If record exists, add to the comments array
    const updatedComments = [
      ...record.comments,
      {
        comment: args.comment,
        created_at: new Date().toISOString()
      }
    ];
    
    await ctx.db.patch(record._id, {
      comments: updatedComments,
      spoiler: args.spoiler !== undefined ? args.spoiler : record.spoiler,
      updated_at: new Date().toISOString(),
    });
    
    return await ctx.db.get(record._id);
  },
});

// Get all ratings for a specific movie (useful for calculating average ratings, etc.)
export const getMovieRatings = query({
  args: {
    movieId: v.id("movies"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // This would require an index on movie_id to be efficient
    // For now, getting all records for a movie and filtering
    const allRecords = await ctx.db
      .query("user_movie_lists")
      .withIndex("movie_id", q => q.eq("movie_id", args.movieId))
      .collect();
    
    // Filter to only records with ratings
    const ratings = allRecords
      .filter(record => record.rating)
      .map(record => ({
        userId: record.user_id,
        rating: record.rating,
        userMovieListId: record._id,
      }));
    
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    
    return ratings.slice(offset, offset + limit);
  },
});

// Get all watched movies for a user (useful for recommendations)
export const getUserWatchedMovies = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // This query would work better with a proper index on user_id with a filter for watched status
    const allUserRecords = await ctx.db
      .query("user_movie_lists")
      .withIndex("user_id", q => q.eq("user_id", args.userId))
      .collect();
    
    // Filter to only records where watched status exists
    const watchedRecords = allUserRecords.filter(record => record.watched);
    
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    
    return watchedRecords.slice(offset, offset + limit);
  },
});

// Get all movies on a user's watchlist
export const getUserWatchlist = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // This query would work better with a proper index on user_id with a filter for watchlist status
    const allUserRecords = await ctx.db
      .query("user_movie_lists")
      .withIndex("user_id", q => q.eq("user_id", args.userId))
      .collect();
    
    // Filter to only records where watchlist status exists
    const watchlistRecords = allUserRecords.filter(record => record.watchlist);
    
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    
    return watchlistRecords.slice(offset, offset + limit);
  },
});
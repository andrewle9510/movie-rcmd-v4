import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel";

// Get user profile information
export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Return user profile data
    return {
      id: user._id,
      username: user.username,
      display_name: user.display_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      preferences: {
        fav_genres: user.fav_genres,
        adult_content: user.adult_content,
        notification_settings: user.notification_settings,
        language: user.language,
      },
      privacy: {
        profile_public: user.profile_public,
        watch_history_public: user.watch_history_public,
        show_ratings_public: user.show_ratings_public,
      },
      followed: {
        crew_members: user.followed_crew_members,
        studios: user.followed_studios,
        other_users: user.followed_users,
      }
    };
  },
});

// Update user profile settings
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    username: v.optional(v.string()),
    display_name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    fav_genres: v.optional(v.array(v.string())),
    adult_content: v.optional(v.boolean()),
    notification_settings: v.optional(v.object({
      email: v.boolean(),
      push: v.boolean()
    })),
    language: v.optional(v.string()),
    profile_public: v.optional(v.boolean()),
    watch_history_public: v.optional(v.boolean()),
    show_ratings_public: v.optional(v.boolean()),
    followed_crew_members: v.optional(v.array(v.string())),
    followed_studios: v.optional(v.array(v.string())),
    followed_users: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { userId, ...updateFields } = args;
    
    // Only update fields that were provided
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Merge existing user data with updates
    const updatedUser = {
      ...user,
      ...Object.fromEntries(
        Object.entries(updateFields).filter(([_, value]) => value !== undefined)
      ),
      updated_at: new Date().toISOString(),
    };
    
    return await ctx.db.patch(userId, updatedUser);
  },
});

// Get user's movie list (watchlist, watched, ratings, etc.)
export const getUserMovieList = query({
  args: {
    userId: v.id("users"),
    movieId: v.optional(v.id("movies")),
    status: v.optional(v.string()), // 'watchlist', 'watched', 'ignored', 'rated'
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("user_movie_lists").withIndex("user_id", q => q.eq("user_id", args.userId));
    
    if (args.movieId) {
      query = query.withIndex("user_id_movie_id", q => 
        q.eq("user_id", args.userId).eq("movie_id", args.movieId!)
      );
    }
    
    let userMovieList = await query.collect();
    
    // Filter by status if specified
    if (args.status) {
      if (args.status === 'watchlist') {
        userMovieList = userMovieList.filter(item => item.watchlist);
      } else if (args.status === 'watched') {
        userMovieList = userMovieList.filter(item => item.watched);
      } else if (args.status === 'ignored') {
        userMovieList = userMovieList.filter(item => item.ignored);
      } else if (args.status === 'rated') {
        userMovieList = userMovieList.filter(item => item.rating);
      }
    }
    
    return userMovieList;
  },
});

// Update user's interaction with a movie (watchlist, watched, rating, etc.)
export const updateUserMovieStatus = mutation({
  args: {
    userId: v.id("users"),
    movieId: v.id("movies"),
    action: v.string(), // 'add_to_watchlist', 'remove_from_watchlist', 'mark_watched', 'rate_movie', etc.
    rating: v.optional(v.object({
      score: v.number(),
      scale: v.number(),
    })),
    comment: v.optional(v.string()),
    spoiler: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    reason: v.optional(v.string()), // for ignoring a movie
  },
  handler: async (ctx, args) => {
    // Check if user-movie record already exists
    const existingRecord = await ctx.db
      .query("user_movie_lists")
      .withIndex("user_id_movie_id", q => 
        q.eq("user_id", args.userId).eq("movie_id", args.movieId)
      )
      .unique();
    
    let recordId: Id<"user_movie_lists">;
    
    // Prepare the update object based on the action
    const updateData: any = {
      user_id: args.userId,
      movie_id: args.movieId,
      updated_at: new Date().toISOString(),
    };
    
    if (!existingRecord) {
      // Create new record
      updateData.created_at = new Date().toISOString();
      updateData.comments = [];
      updateData.tags = args.tags || [];
      updateData.spoiler = args.spoiler || false;
    } else {
      // Use existing data and update specific fields
      updateData.comments = existingRecord.comments || [];
      updateData.tags = existingRecord.tags || [];
      updateData.spoiler = existingRecord.spoiler || args.spoiler || false;
    }
    
    // Process the specific action
    switch (args.action) {
      case 'add_to_watchlist':
        updateData.watchlist = {
          added_at: new Date().toISOString(),
          order: 0 // To be updated by user later
        };
        break;
        
      case 'remove_from_watchlist':
        updateData.watchlist = undefined;
        break;
        
      case 'mark_watched':
        if (existingRecord?.watched) {
          // Update last watched time and increment watch count
          updateData.watched = {
            ...existingRecord.watched,
            last_watched_at: new Date().toISOString(),
            watch_count: existingRecord.watched.watch_count + 1
          };
        } else {
          // First time watching
          updateData.watched = {
            first_watched_at: new Date().toISOString(),
            last_watched_at: new Date().toISOString(),
            watch_count: 1
          };
        }
        break;
        
      case 'rate_movie':
        if (args.rating) {
          updateData.rating = {
            score: args.rating.score,
            scale: args.rating.scale,
            rated_at: new Date().toISOString()
          };
        }
        break;
        
      case 'comment_on_movie':
        if (args.comment) {
          const newComment = {
            comment: args.comment,
            created_at: new Date().toISOString()
          };
          updateData.comments = [...updateData.comments, newComment];
        }
        break;
        
      case 'add_tags':
        if (args.tags) {
          // Add new tags, avoiding duplicates
          const currentTags = new Set(updateData.tags);
          args.tags.forEach(tag => currentTags.add(tag));
          updateData.tags = Array.from(currentTags);
        }
        break;
        
      case 'toggle_spoiler':
        updateData.spoiler = args.spoiler ?? !updateData.spoiler;
        break;
        
      case 'ignore_movie':
        updateData.ignored = {
          added_at: new Date().toISOString(),
          reason: args.reason
        };
        break;
        
      case 'unignore_movie':
        updateData.ignored = undefined;
        break;
    }
    
    if (!existingRecord) {
      recordId = await ctx.db.insert("user_movie_lists", updateData);
    } else {
      await ctx.db.patch(existingRecord._id, updateData);
      recordId = existingRecord._id;
    }
    
    // Also create a user event for this action
    await ctx.db.insert("user_events", {
      user_id: args.userId,
      movie_id: args.movieId,
      event_type: `movie_${args.action.replace(/_/g, '')}`,
      event_details: {
        action: args.action,
      },
      timestamp: new Date().toISOString(),
      session_id: "system", // In real implementation, this should come from context
      context: {
        source_page: "movie_detail",
        source_section: "user_interaction",
      },
    });
    
    return await ctx.db.get(recordId);
  },
});

// Follow or unfollow a crew member
export const followCrewMember = mutation({
  args: {
    userId: v.id("users"),
    crewId: v.string(),
    follow: v.boolean(), // true to follow, false to unfollow
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const currentFollowed = user.followed_crew_members || [];
    let newFollowed: string[];
    
    if (args.follow) {
      // Add to followed if not already there
      if (!currentFollowed.includes(args.crewId)) {
        newFollowed = [...currentFollowed, args.crewId];
      } else {
        newFollowed = currentFollowed;
      }
    } else {
      // Remove from followed
      newFollowed = currentFollowed.filter(id => id !== args.crewId);
    }
    
    await ctx.db.patch(args.userId, {
      followed_crew_members: newFollowed,
      updated_at: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

// Follow or unfollow a studio
export const followStudio = mutation({
  args: {
    userId: v.id("users"),
    studioId: v.string(),
    follow: v.boolean(), // true to follow, false to unfollow
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const currentFollowed = user.followed_studios || [];
    let newFollowed: string[];
    
    if (args.follow) {
      // Add to followed if not already there
      if (!currentFollowed.includes(args.studioId)) {
        newFollowed = [...currentFollowed, args.studioId];
      } else {
        newFollowed = currentFollowed;
      }
    } else {
      // Remove from followed
      newFollowed = currentFollowed.filter(id => id !== args.studioId);
    }
    
    await ctx.db.patch(args.userId, {
      followed_studios: newFollowed,
      updated_at: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

// Follow or unfollow another user
export const followUser = mutation({
  args: {
    userId: v.id("users"), // The user performing the action
    targetUserId: v.id("users"), // The user being followed
    follow: v.boolean(), // true to follow, false to unfollow
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const currentFollowed = user.followed_users || [];
    let newFollowed: string[];
    
    if (args.follow) {
      // Add to followed if not already there
      if (!currentFollowed.includes(args.targetUserId.toString())) {
        newFollowed = [...currentFollowed, args.targetUserId.toString()];
      } else {
        newFollowed = currentFollowed;
      }
    } else {
      // Remove from followed
      newFollowed = currentFollowed.filter(id => id !== args.targetUserId.toString());
    }
    
    await ctx.db.patch(args.userId, {
      followed_users: newFollowed,
      updated_at: new Date().toISOString(),
    });
    
    return { success: true };
  },
});

// Create a new user
export const createUser = mutation({
  args: {
    authId: v.string(),
    username: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const newUserId = await ctx.db.insert("users", {
      auth_id: args.authId,
      username: args.username,
      display_name: args.displayName,
      bio: "",
      avatar_url: "",
      created_at: new Date().toISOString(),
      fav_genres: [],
      adult_content: true,
      notification_settings: {
        email: true,
        push: false
      },
      language: "en",
      profile_public: true,
      watch_history_public: false,
      show_ratings_public: true,
      followed_crew_members: [],
      followed_studios: [],
      followed_users: [],
    });
    
    return await ctx.db.get(newUserId);
  },
});
// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel";

// Record a user behavior event
export const recordEvent = mutation({
  args: {
    userId: v.id("users"),
    eventType: v.string(), // e.g., "movie_clicked", "movie_watched", "movie_rated", "search_performed", etc.
    movieId: v.optional(v.id("movies")),
    eventDetails: v.object({
      action: v.string(),
      deviceType: v.optional(v.string()), // mobile, tablet, desktop
      platform: v.optional(v.string()), // ios, android, web
      durationSeconds: v.optional(v.number()),
      progressPercentage: v.optional(v.number()),
    }),
    context: v.optional(v.object({
      sourcePage: v.string(),
      sourceSection: v.optional(v.string()),
      sourcePosition: v.optional(v.number()),
      previousMovie: v.optional(v.id("movies")),
      referrer: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("user_events", {
      user_id: args.userId,
      movie_id: args.movieId,
      event_type: args.eventType,
      event_details: {
        action: args.eventDetails.action,
        device_type: args.eventDetails.deviceType,
        platform: args.eventDetails.platform,
        duration_seconds: args.eventDetails.durationSeconds,
        progress_percentage: args.eventDetails.progressPercentage,
      },
      timestamp: new Date().toISOString(),
      session_id: "system", // In a real implementation, this would come from the session context
      context: args.context ? {
        source_page: args.context.sourcePage,
        source_section: args.context.sourceSection,
        source_position: args.context.sourcePosition,
        previous_movie: args.context.previousMovie,
        referrer: args.context.referrer,
      } : undefined,
    });
    
    return await ctx.db.get(eventId);
  },
});

// Get user events for a specific user
export const getUserEvents = query({
  args: {
    userId: v.id("users"),
    eventType: v.optional(v.string()),
    movieId: v.optional(v.id("movies")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    from: v.optional(v.string()), // ISO date string
    to: v.optional(v.string()), // ISO date string
  },
  handler: async (ctx, args) => {
    // Build the query based on provided filters
    let queryBuilder = ctx.db.query("user_events").withIndex("user_id", q => q.eq("user_id", args.userId));
    
    if (args.eventType) {
      queryBuilder = queryBuilder.withIndex("user_id_event_type", q => 
        q.eq("user_id", args.userId).eq("event_type", args.eventType!)
      );
    }
    
    if (args.movieId) {
      // If we have user_id_event_type filter, we need a different index
      // For now, we'll filter in memory after database query
      const allEvents = await queryBuilder.collect();
      let filteredEvents = allEvents.filter(event => 
        event.movie_id && event.movie_id === args.movieId
      );
      
      // Apply date filters if provided
      if (args.from) {
        const fromDate = new Date(args.from);
        filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= fromDate);
      }
      
      if (args.to) {
        const toDate = new Date(args.to);
        filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) <= toDate);
      }
      
      const limit = args.limit || 50;
      const offset = args.offset || 0;
      
      return filteredEvents.slice(offset, offset + limit);
    } else {
      // Apply date filters if provided
      const allEvents = await queryBuilder.collect();
      let filteredEvents = allEvents;
      
      if (args.from) {
        const fromDate = new Date(args.from);
        filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= fromDate);
      }
      
      if (args.to) {
        const toDate = new Date(args.to);
        filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) <= toDate);
      }
      
      const limit = args.limit || 50;
      const offset = args.offset || 0;
      
      return filteredEvents.slice(offset, offset + limit);
    }
  },
});

// Get events for a specific movie (useful for analytics)
export const getMovieEvents = query({
  args: {
    movieId: v.id("movies"),
    eventType: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // This would work better with a proper index on movie_id
    const allEvents = await ctx.db
      .query("user_events")
      .withIndex("movie_id", q => q.eq("movie_id", args.movieId))
      .collect();
    
    // Filter by event type if specified
    let filteredEvents = allEvents;
    if (args.eventType) {
      filteredEvents = filteredEvents.filter(event => event.event_type === args.eventType);
    }
    
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    
    return filteredEvents.slice(offset, offset + limit);
  },
});

// Get recent user activity (for dashboard or notifications)
export const getRecentUserActivity = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    return await ctx.db
      .query("user_events")
      .withIndex("user_id", q => q.eq("user_id", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get user session data (events grouped by session)
export const getUserSessions = query({
  args: {
    userId: v.id("users"),
    from: v.optional(v.string()), // ISO date string
    to: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allEvents = await ctx.db
      .query("user_events")
      .withIndex("user_id", q => q.eq("user_id", args.userId))
      .collect();
    
    // Filter by date if provided
    let filteredEvents = allEvents;
    if (args.from) {
      const fromDate = new Date(args.from);
      filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= fromDate);
    }
    
    if (args.to) {
      const toDate = new Date(args.to);
      filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) <= toDate);
    }
    
    // Group events by session_id
    const sessions = filteredEvents.reduce((acc: any, event) => {
      const sessionId = event.session_id;
      if (!acc[sessionId]) {
        acc[sessionId] = {
          sessionId,
          events: [],
          startTime: event.timestamp,
          endTime: event.timestamp,
        };
      }
      
      acc[sessionId].events.push(event);
      
      // Update session start/end times
      if (event.timestamp < acc[sessionId].startTime) {
        acc[sessionId].startTime = event.timestamp;
      }
      if (event.timestamp > acc[sessionId].endTime) {
        acc[sessionId].endTime = event.timestamp;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by the most recent session
    const sessionArray = Object.values(sessions)
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    return args.limit ? sessionArray.slice(0, args.limit) : sessionArray;
  },
});

// Get aggregate statistics for a user (useful for recommendations)
export const getUserStatistics = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allEvents = await ctx.db
      .query("user_events")
      .withIndex("user_id", q => q.eq("user_id", args.userId))
      .collect();
    
    // Calculate statistics
    const stats = {
      totalEvents: allEvents.length,
      eventsByType: {} as Record<string, number>,
      totalMovieInteractions: 0,
      activeDays: new Set<string>(),
    };
    
    allEvents.forEach(event => {
      // Count events by type
      stats.eventsByType[event.event_type] = (stats.eventsByType[event.event_type] || 0) + 1;
      
      // Count movie interactions
      if (event.movie_id) {
        stats.totalMovieInteractions++;
      }
      
      // Track active days
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      stats.activeDays.add(date);
    });
    
    return {
      ...stats,
      activeDaysCount: stats.activeDays.size,
    };
  },
});

// Delete old events (for data retention policies)
export const cleanupOldEvents = mutation({
  args: {
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - args.olderThanDays);
    
    const allEvents = await ctx.db.query("user_events").collect();
    
    let deletedCount = 0;
    for (const event of allEvents) {
      if (new Date(event.timestamp) < cutoffDate) {
        await ctx.db.delete(event._id);
        deletedCount++;
      }
    }
    
    return { deletedCount, cutoffDate: cutoffDate.toISOString() };
  },
});
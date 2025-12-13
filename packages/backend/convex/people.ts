// @ts-nocheck
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertPeople = mutation({
  args: {
    people: v.array(
      v.object({
        tmdb_person_id: v.number(),
        name: v.string(),
        profile_path: v.union(v.string(), v.null()),
        department: v.union(v.string(), v.null()),
        character: v.union(v.string(), v.null()),
        updated_at: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const person of args.people) {
      const existing = await ctx.db
        .query("people")
        .withIndex("by_tmdb_person_id", (q) => q.eq("tmdb_person_id", person.tmdb_person_id))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: person.name,
          profile_path: person.profile_path,
          department: person.department,
          character: person.character,
          updated_at: person.updated_at,
        });
      } else {
        await ctx.db.insert("people", person);
      }
    }

    return { success: true, count: args.people.length };
  },
});

export const getPeopleByTmdbIds = query({
  args: {
    ids: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const results: any[] = [];
    for (const id of args.ids) {
      const person = await ctx.db
        .query("people")
        .withIndex("by_tmdb_person_id", (q) => q.eq("tmdb_person_id", id))
        .unique();
      if (person) results.push(person);
    }
    return results;
  },
});

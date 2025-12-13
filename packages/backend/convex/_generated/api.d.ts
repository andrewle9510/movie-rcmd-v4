/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dbImporter from "../dbImporter.js";
import type * as execConvexImportTmdbWorkflow from "../execConvexImportTmdbWorkflow.js";
import type * as execLocalImportTmdbWorkflow from "../execLocalImportTmdbWorkflow.js";
import type * as healthCheck from "../healthCheck.js";
import type * as lib_utils from "../lib/utils.js";
import type * as migrations from "../migrations.js";
import type * as movieDataInterfaces from "../movieDataInterfaces.js";
import type * as movies from "../movies.js";
import type * as people from "../people.js";
import type * as peopleBackfill from "../peopleBackfill.js";
import type * as tmdbFetcher from "../tmdbFetcher.js";
import type * as tmdbLocalFetch from "../tmdbLocalFetch.js";
import type * as user_events from "../user_events.js";
import type * as user_movie_lists from "../user_movie_lists.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dbImporter: typeof dbImporter;
  execConvexImportTmdbWorkflow: typeof execConvexImportTmdbWorkflow;
  execLocalImportTmdbWorkflow: typeof execLocalImportTmdbWorkflow;
  healthCheck: typeof healthCheck;
  "lib/utils": typeof lib_utils;
  migrations: typeof migrations;
  movieDataInterfaces: typeof movieDataInterfaces;
  movies: typeof movies;
  people: typeof people;
  peopleBackfill: typeof peopleBackfill;
  tmdbFetcher: typeof tmdbFetcher;
  tmdbLocalFetch: typeof tmdbLocalFetch;
  user_events: typeof user_events;
  user_movie_lists: typeof user_movie_lists;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

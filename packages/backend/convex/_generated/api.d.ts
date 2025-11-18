/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as api_ from "../api.js";
import type * as dbImporter from "../dbImporter.js";
import type * as execConvexImportTmdbWorkflow from "../execConvexImportTmdbWorkflow.js";
import type * as execLocalImportTmdbWorkflow from "../execLocalImportTmdbWorkflow.js";
import type * as healthCheck from "../healthCheck.js";
import type * as movieDataInterfaces from "../movieDataInterfaces.js";
import type * as movies from "../movies.js";
import type * as tmdbFetcher from "../tmdbFetcher.js";
import type * as user_events from "../user_events.js";
import type * as user_movie_lists from "../user_movie_lists.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  api: typeof api_;
  dbImporter: typeof dbImporter;
  execConvexImportTmdbWorkflow: typeof execConvexImportTmdbWorkflow;
  execLocalImportTmdbWorkflow: typeof execLocalImportTmdbWorkflow;
  healthCheck: typeof healthCheck;
  movieDataInterfaces: typeof movieDataInterfaces;
  movies: typeof movies;
  tmdbFetcher: typeof tmdbFetcher;
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

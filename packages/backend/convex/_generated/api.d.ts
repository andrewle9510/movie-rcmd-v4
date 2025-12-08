/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as features_movies_movieDataInterfaces from "../features/movies/movieDataInterfaces.js";
import type * as features_movies_queries_movies from "../features/movies/queries/movies.js";
import type * as features_tmdb_sync_actions_dbImporter from "../features/tmdb_sync/actions/dbImporter.js";
import type * as features_tmdb_sync_actions_execConvexImportTmdbWorkflow from "../features/tmdb_sync/actions/execConvexImportTmdbWorkflow.js";
import type * as features_tmdb_sync_actions_execLocalImportTmdbWorkflow from "../features/tmdb_sync/actions/execLocalImportTmdbWorkflow.js";
import type * as features_tmdb_sync_actions_tmdbFetcher from "../features/tmdb_sync/actions/tmdbFetcher.js";
import type * as features_tmdb_sync_actions_tmdbLocalFetch from "../features/tmdb_sync/actions/tmdbLocalFetch.js";
import type * as features_users_mutations_user_events from "../features/users/mutations/user_events.js";
import type * as features_users_queries_users from "../features/users/queries/users.js";
import type * as features_watchlist_queries_user_movie_lists from "../features/watchlist/queries/user_movie_lists.js";
import type * as lib_healthCheck from "../lib/healthCheck.js";
import type * as lib_migrations from "../lib/migrations.js";
import type * as lib_utils from "../lib/utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "features/movies/movieDataInterfaces": typeof features_movies_movieDataInterfaces;
  "features/movies/queries/movies": typeof features_movies_queries_movies;
  "features/tmdb_sync/actions/dbImporter": typeof features_tmdb_sync_actions_dbImporter;
  "features/tmdb_sync/actions/execConvexImportTmdbWorkflow": typeof features_tmdb_sync_actions_execConvexImportTmdbWorkflow;
  "features/tmdb_sync/actions/execLocalImportTmdbWorkflow": typeof features_tmdb_sync_actions_execLocalImportTmdbWorkflow;
  "features/tmdb_sync/actions/tmdbFetcher": typeof features_tmdb_sync_actions_tmdbFetcher;
  "features/tmdb_sync/actions/tmdbLocalFetch": typeof features_tmdb_sync_actions_tmdbLocalFetch;
  "features/users/mutations/user_events": typeof features_users_mutations_user_events;
  "features/users/queries/users": typeof features_users_queries_users;
  "features/watchlist/queries/user_movie_lists": typeof features_watchlist_queries_user_movie_lists;
  "lib/healthCheck": typeof lib_healthCheck;
  "lib/migrations": typeof lib_migrations;
  "lib/utils": typeof lib_utils;
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

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { transformMovieData } from "@/lib/movie-utils";
import type { Id } from "@/convex/_generated/dataModel";

export function useMovie(id: string) {
  const isTmdbId = /^\d+$/.test(id);
  const tmdbId = isTmdbId ? parseInt(id, 10) : null;

  const convexMovieById = useQuery(api.movies.getMovie, 
    !isTmdbId ? { id: id as Id<"movies"> } : "skip"
  );

  const convexMovieByTmdbId = useQuery(api.movies.getMovieByTmdbId,
    isTmdbId && tmdbId !== null ? { tmdbId } : "skip"
  );

  const convexMovie = isTmdbId ? convexMovieByTmdbId : convexMovieById;

  if (convexMovie === undefined) {
    return { movie: undefined, isLoading: true, error: null };
  }

  if (convexMovie === null) {
    return { movie: null, isLoading: false, error: "Movie not found" };
  }

  const movie = transformMovieData(convexMovie);

  return { movie, isLoading: false, error: null };
}

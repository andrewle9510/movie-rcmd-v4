"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { transformMovieData } from "@/lib/movie-utils";
import type { Id } from "@/convex/_generated/dataModel";
import { useMoviesContext } from "@/providers/MoviesProvider";

export function useMovie(id: string) {
  const isTmdbId = /^\d+$/.test(id);
  const tmdbId = isTmdbId ? parseInt(id, 10) : null;

  // First, try to find the movie in the MoviesProvider cache
  const { findMovieById, findMovieByTmdbId, movies: cachedMovies } = useMoviesContext();
  
  let cachedMovie = null;
  if (cachedMovies) {
    cachedMovie = isTmdbId ? findMovieByTmdbId(tmdbId!) : findMovieById(id);
  }

  // If found in cache, return it immediately
  if (cachedMovie && cachedMovie._id) {
    return { 
      movie: transformMovieData(cachedMovie), 
      isLoading: false, 
      error: null 
    };
  }

  // If not in cache, fallback to individual query
  const convexMovieById = useQuery(api.movies.getMovie, 
    !isTmdbId && !cachedMovie ? { id: id as Id<"movies"> } : "skip"
  );

  const convexMovieByTmdbId = useQuery(api.movies.getMovieByTmdbId,
    isTmdbId && tmdbId !== null && !cachedMovie ? { tmdbId } : "skip"
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

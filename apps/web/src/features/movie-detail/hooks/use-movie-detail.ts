"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { transformMovieData } from "../../movie-browsing/utils/movie-utils";
import type { Id } from "@/convex/_generated/dataModel";
import { useMoviesContext } from "@/shared/providers/MoviesProvider";
import { useMemo, useRef } from "react";
import type { Movie } from "@/shared/types/movie";

interface MovieResult {
  movie: Movie | undefined | null;
  isLoading: boolean;
  error: string | null;
}

export function useMovie(id: string): MovieResult {
  const isTmdbId = useMemo(() => /^\d+$/.test(id), [id]);
  const tmdbId = useMemo(() => isTmdbId ? parseInt(id, 10) : null, [id, isTmdbId]);

  // First, try to find the movie in the MoviesProvider cache
  const { movies: cachedMovies } = useMoviesContext();
  
  // Memoize the cached movie lookup
  const cachedMovie = useMemo(() => {
    if (!cachedMovies) return null;
    return isTmdbId 
      ? cachedMovies.find((m: any) => m.tmdb_id === tmdbId)
      : cachedMovies.find((m: any) => m._id === id);
  }, [cachedMovies, id, isTmdbId, tmdbId]);

  // Memoize the transformed cached movie separately - only recalculates when cachedMovie changes
  const transformedCachedMovie = useMemo(() => {
    if (!cachedMovie?._id) return null;
    return transformMovieData(cachedMovie);
  }, [cachedMovie]);

  // Use ref to store stable cached result - prevents re-renders from Convex query updates
  const cachedResultRef = useRef<MovieResult | null>(null);
  
  // Update ref only when transformed movie actually changes
  if (transformedCachedMovie) {
    if (!cachedResultRef.current || cachedResultRef.current.movie !== transformedCachedMovie) {
      cachedResultRef.current = {
        movie: transformedCachedMovie,
        isLoading: false,
        error: null
      };
    }
  }

  const skipQuery = !!transformedCachedMovie;

  // If not in cache, fallback to individual query
  const convexMovieById = useQuery(api.movies.getMovie, 
    !isTmdbId && !skipQuery ? { id: id as Id<"movies"> } : "skip"
  );

  const convexMovieByTmdbId = useQuery(api.movies.getMovieByTmdbId,
    isTmdbId && tmdbId !== null && !skipQuery ? { tmdbId } : "skip"
  );

  // Return cached result if available - stable reference from ref
  if (cachedResultRef.current) {
    return cachedResultRef.current;
  }

  // Only compute from Convex results when no cache
  const convexMovie = isTmdbId ? convexMovieByTmdbId : convexMovieById;

  if (convexMovie === undefined) {
    return { movie: undefined, isLoading: true, error: null };
  }

  if (convexMovie === null) {
    return { movie: null, isLoading: false, error: "Movie not found" };
  }

  return { 
    movie: transformMovieData(convexMovie), 
    isLoading: false, 
    error: null 
  };
}

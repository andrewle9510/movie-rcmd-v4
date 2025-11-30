"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  getMoviesFromCache, 
  saveMoviesToCache, 
  clearMovieCache, 
  hasValidCache,
  getCacheStatus,
  type MovieCacheStatus 
} from "@/lib/movie-cache";

interface MoviesContextType {
  movies: any[] | undefined;
  isLoading: boolean;
  error: boolean;
  findMovieById: (id: string) => any | null;
  findMovieByTmdbId: (tmdbId: number) => any | null;
  cacheStatus: MovieCacheStatus;
  forceRefresh: () => void;
  isUsingCache: boolean;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: ReactNode }) {
  // Try to load from cache first
  const cachedMovies = getMoviesFromCache();
  const hasCache = hasValidCache();
  const [movies, setMovies] = useState(cachedMovies || undefined);
  const [isUsingCache, setIsUsingCache] = useState(!!cachedMovies);
  const [isLoading, setIsLoading] = useState(!cachedMovies);
  const error = false;

  // Only fetch from Convex if no cached data
  const convexMovies = useQuery(api.movies.getMovies, 
    cachedMovies ? "skip" : undefined
  );

  // Handle Convex data arrival and save to cache
  const handleConvexData = useCallback((data: any[]) => {
    setMovies(data);
    setIsUsingCache(false);
    setIsLoading(false);
    saveMoviesToCache(data);
  }, []);

  // Update when Convex data arrives
  useEffect(() => {
    if (convexMovies) {
      handleConvexData(convexMovies);
    }
  }, [convexMovies, handleConvexData]);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    clearMovieCache();
    setMovies(undefined);
    setIsUsingCache(false);
    setIsLoading(true);
  }, []);

  // Helper function to find movie by Convex ID
  const findMovieById = useCallback((id: string) => {
    if (!movies || movies.length === 0) return null;
    return movies.find((movie: any) => movie._id === id) || null;
  }, [movies]);

  // Helper function to find movie by TMDB ID
  const findMovieByTmdbId = useCallback((tmdbId: number) => {
    if (!movies || movies.length === 0) return null;
    return movies.find((movie: any) => movie.tmdb_id === tmdbId) || null;
  }, [movies]);

  // Cache status for UI
  const cacheStatus = useMemo(() => getCacheStatus(), []);

  const contextValue = useMemo(() => ({
    movies,
    isLoading,
    error,
    findMovieById,
    findMovieByTmdbId,
    cacheStatus,
    forceRefresh,
    isUsingCache
  }), [movies, isLoading, error, findMovieById, findMovieByTmdbId, cacheStatus, forceRefresh, isUsingCache]);

  return (
    <MoviesContext.Provider value={contextValue}>
      {children}
    </MoviesContext.Provider>
  );
}

export function useMoviesContext() {
  const context = useContext(MoviesContext);
  if (!context) {
    throw new Error("useMoviesContext must be used within MoviesProvider");
  }
  return context;
}

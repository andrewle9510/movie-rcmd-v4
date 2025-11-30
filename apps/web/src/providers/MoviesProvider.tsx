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
  // Initialize state to match server rendering (loading state)
  const [movies, setMovies] = useState<any[] | undefined>(undefined);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);
  
  const error = false;

  // Check cache on mount only
  useEffect(() => {
    const cachedMovies = getMoviesFromCache();
    if (cachedMovies) {
      setMovies(cachedMovies);
      setIsUsingCache(true);
      setIsLoading(false);
    } else {
      setShouldFetch(true);
    }
  }, []);

  // Only fetch from Convex if explicitly requested (no cache found)
  const convexMovies = useQuery(api.movies.getMovies, 
    shouldFetch ? undefined : "skip"
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
  const [cacheStatus, setCacheStatus] = useState<MovieCacheStatus>({
    hasCache: false,
    timestamp: '',
    lastUpdated: null,
    version: '1.0.0'
  });

  // Update cache status on mount
  useEffect(() => {
    setCacheStatus(getCacheStatus());
  }, [movies]); // Update when movies change (e.g. after fetch or clear)

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

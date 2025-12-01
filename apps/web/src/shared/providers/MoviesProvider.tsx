"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  getMoviesFromCache, 
  saveMoviesToCache, 
  getCacheStatus,
  isCacheMoviesDataStale,
  saveDbFetchTime
} from "@/features/movie-browsing/utils/movie-cache";

interface MoviesContextType {
  movies: any[] | undefined;
  isLoading: boolean;
  error: boolean;
  isUsingMoviesCache: boolean;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: ReactNode }) {
  // Initialize state to match server rendering (loading state)
  const [movies, setMovies] = useState<any[] | undefined>(undefined);
  const [isUsingMoviesCache, setIsUsingMoviesCache] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldFetchMovies, setShouldFetchMovies] = useState(false);
  const [hasCheckedMoviesDataVersion, setHasCheckedMoviesDataVersion] = useState(false);
  const moviesDataVersionRef = useRef<string | null>(null);
  
  const error = false;

  // Fetch movies data version to check if cache is stale
  const moviesDataVersion = useQuery(api.movies.getMoviesDataVersion);

  // Check cache immediately (don't wait for movies data version query)
  useEffect(() => {
    if (!hasCheckedMoviesDataVersion) {
      // Try to load cache immediately without waiting for server movies data version
      const cachedMovies = getMoviesFromCache();
      
      if (cachedMovies) {
        // Use cached data immediately if available
        console.log("📦 Setting movies from cache, count:", cachedMovies.length);
        const cacheStatus = getCacheStatus();
        setMovies(cachedMovies);
        moviesDataVersionRef.current = cacheStatus.moviesDataVersion;
        setIsUsingMoviesCache(true);
        setIsLoading(false);
      }
      
      setHasCheckedMoviesDataVersion(true);
    }
  }, [hasCheckedMoviesDataVersion]);

  // Check if cache is stale once we get the server movies data version
  useEffect(() => {
    if (hasCheckedMoviesDataVersion && moviesDataVersion && isUsingMoviesCache) {
      // Check if cache is stale now that we have the movies data version
      if (isCacheMoviesDataStale(moviesDataVersion.moviesDataVersion)) {
        // Cache is stale, fetch fresh data
        setShouldFetchMovies(true);
      }
    }
  }, [moviesDataVersion, hasCheckedMoviesDataVersion, isUsingMoviesCache]);

  // Only fetch from Convex if explicitly requested (no cache or stale cache)
  const convexMovies = useQuery(api.movies.getMovies, 
    shouldFetchMovies ? undefined : "skip"
  );

  // Handle Convex data arrival and save to cache
  const handleConvexData = useCallback((data: any[], version: string) => {
    // Guard: Skip if version matches current movies data version
    if (version === moviesDataVersionRef.current) {
      console.log("⚡️ Movies data version match, skipping update");
      return;
    }

    console.log("🌐 Setting movies from Convex, count:", data.length);
    setMovies(data);
    moviesDataVersionRef.current = version;
    setIsUsingMoviesCache(false);
    setIsLoading(false);
    saveMoviesToCache(data, version);
    saveDbFetchTime();
  }, []);

  // Update when Convex data arrives
  useEffect(() => {
    if (convexMovies && moviesDataVersion) {
      handleConvexData(convexMovies, moviesDataVersion.moviesDataVersion);
    }
  }, [convexMovies, moviesDataVersion, handleConvexData]);

  // Create stable context value - ONLY include data that should trigger re-renders
  const contextValue = useMemo(() => ({
    movies,
    isLoading,
    error,
    isUsingMoviesCache
  }), [movies, isLoading, error, isUsingMoviesCache]);

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

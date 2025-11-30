"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  getMoviesFromCache, 
  saveMoviesToCache, 
  getCacheStatus,
  isCacheDataStale
} from "@/lib/movie-cache";

interface MoviesContextType {
  movies: any[] | undefined;
  isLoading: boolean;
  error: boolean;
  isUsingCache: boolean;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: ReactNode }) {
  // Initialize state to match server rendering (loading state)
  const [movies, setMovies] = useState<any[] | undefined>(undefined);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [hasCheckedVersion, setHasCheckedVersion] = useState(false);
  const dataVersionRef = useRef<string | null>(null);
  
  const error = false;

  // Fetch movies data version to check if cache is stale
  const moviesDataVersion = useQuery(api.movies.getMoviesDataVersion);

  // Check cache immediately (don't wait for moviesDataVersion query)
  useEffect(() => {
    if (!hasCheckedVersion) {
      // Try to load cache immediately without waiting for server data version
      const cachedMovies = getMoviesFromCache();
      
      if (cachedMovies) {
        // Use cached data immediately if available
        console.log("📦 Setting movies from cache, count:", cachedMovies.length);
        const cacheStatus = getCacheStatus();
        setMovies(cachedMovies);
        dataVersionRef.current = cacheStatus.moviesDataVersion;
        setIsUsingCache(true);
        setIsLoading(false);
      }
      
      setHasCheckedVersion(true);
    }
  }, [hasCheckedVersion]);

  // Check if cache is stale once we get the server data version
  useEffect(() => {
    if (hasCheckedVersion && moviesDataVersion && isUsingCache) {
      // Check if cache is stale now that we have the version
      if (isCacheDataStale(moviesDataVersion.moviesDataVersion)) {
        // Cache is stale, fetch fresh data
        setShouldFetch(true);
      }
    }
  }, [moviesDataVersion, hasCheckedVersion, isUsingCache]);

  // Only fetch from Convex if explicitly requested (no cache or stale cache)
  const convexMovies = useQuery(api.movies.getMovies, 
    shouldFetch ? undefined : "skip"
  );

  // Handle Convex data arrival and save to cache
  const handleConvexData = useCallback((data: any[], version: string) => {
    // Guard: Skip if version matches current data version
    if (version === dataVersionRef.current) {
      console.log("⚡️ Data version match, skipping update");
      return;
    }

    console.log("🌐 Setting movies from Convex, count:", data.length);
    setMovies(data);
    dataVersionRef.current = version;
    setIsUsingCache(false);
    setIsLoading(false);
    saveMoviesToCache(data, version);
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
    isUsingCache
  }), [movies, isLoading, error, isUsingCache]);

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

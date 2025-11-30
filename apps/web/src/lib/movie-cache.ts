// Local storage utilities for movie data caching

const CACHE_KEY = 'movie-cache';
const CACHE_TIMESTAMP_KEY = 'movie-cache-timestamp';
const CACHE_VERSION_KEY = 'movie-cache-version';
const MOVIES_DATA_VERSION_KEY = 'movies-data-version';
const CURRENT_VERSION = '1.0.0';

export interface MovieCacheStatus {
  hasCache: boolean;
  timestamp: string;
  lastUpdated: string | null;
  version: string;
  moviesDataVersion: string | null;
}

export const saveMoviesToCache = (movies: any[], moviesDataVersion: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(movies));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
      localStorage.setItem(MOVIES_DATA_VERSION_KEY, moviesDataVersion);
    }
  } catch (error) {
    console.error('Failed to save movies to cache:', error);
  }
};

export const getMoviesFromCache = (): any[] | null => {
  try {
    if (typeof window !== 'undefined') {
      const start = performance.now();
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      const duration = performance.now() - start;
      
      // Log if parsing takes longer than 100ms
      if (duration > 100) {
        console.warn(`Cache parse took ${duration.toFixed(2)}ms for ${cached.length} bytes`);
      }
      
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Failed to get movies from cache:', error);
    return null;
  }
};

export const hasValidCache = (): boolean => {
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      const version = localStorage.getItem(CACHE_VERSION_KEY);
      const moviesDataVersion = localStorage.getItem(MOVIES_DATA_VERSION_KEY);
      
      return cached !== null && timestamp !== null && version === CURRENT_VERSION && moviesDataVersion !== null;
    }
    return false;
  } catch {
    return false;
  }
};

export const clearMovieCache = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      localStorage.removeItem(CACHE_VERSION_KEY);
      localStorage.removeItem(MOVIES_DATA_VERSION_KEY);
    }
  } catch (error) {
    console.error('Failed to clear movie cache:', error);
  }
};

export const getCacheTimestamp = (): string => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CACHE_TIMESTAMP_KEY) || '';
    }
    return '';
  } catch {
    return '';
  }
};

export const getCachedMoviesDataVersion = (): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(MOVIES_DATA_VERSION_KEY);
    }
    return null;
  } catch {
    return null;
  }
};

export const isCacheDataStale = (serverMoviesDataVersion: string): boolean => {
  const cachedMoviesDataVersion = getCachedMoviesDataVersion();
  return !cachedMoviesDataVersion || cachedMoviesDataVersion !== serverMoviesDataVersion;
};

export const getCacheStatus = (): MovieCacheStatus => {
  const timestamp = getCacheTimestamp();
  const lastUpdated = timestamp ? new Date(parseInt(timestamp)).toLocaleString() : null;
  const moviesDataVersion = getCachedMoviesDataVersion();
  
  return {
    hasCache: hasValidCache(),
    timestamp,
    lastUpdated,
    version: CURRENT_VERSION,
    moviesDataVersion
  };
};

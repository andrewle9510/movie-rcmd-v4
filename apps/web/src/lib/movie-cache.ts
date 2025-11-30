// Local storage utilities for movie data caching

const CACHE_KEY = 'movie-cache';
const CACHE_TIMESTAMP_KEY = 'movie-cache-timestamp';
const CACHE_VERSION_KEY = 'movie-cache-version';
const CURRENT_VERSION = '1.0.0';

export interface MovieCacheStatus {
  hasCache: boolean;
  timestamp: string;
  lastUpdated: string | null;
  version: string;
}

export const saveMoviesToCache = (movies: any[]): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(movies));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
    }
  } catch (error) {
    console.error('Failed to save movies to cache:', error);
  }
};

export const getMoviesFromCache = (): any[] | null => {
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
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
      
      return cached !== null && timestamp !== null && version === CURRENT_VERSION;
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

export const getCacheStatus = (): MovieCacheStatus => {
  const timestamp = getCacheTimestamp();
  const lastUpdated = timestamp ? new Date(parseInt(timestamp)).toLocaleString() : null;
  
  return {
    hasCache: hasValidCache(),
    timestamp,
    lastUpdated,
    version: CURRENT_VERSION
  };
};

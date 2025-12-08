// Admin cache management utilities

const CACHE_VERSION_KEY = 'movie-cache-app-version';
export const CURRENT_CACHE_VERSION = '1.0.0';

// Initialize cache version checking - call on app start
export const initializeCacheVersion = (): void => {
  // This function is only called on client side, but keep the check for safety
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(CACHE_VERSION_KEY)) {
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
  } else {
    checkVersionCompatibility();
  }
};

// Check if cache version is compatible
export const checkVersionCompatibility = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const currentVersion = localStorage.getItem(CACHE_VERSION_KEY);
  if (currentVersion !== CURRENT_CACHE_VERSION) {
    // Version mismatch, clear movie cache
    localStorage.removeItem('movie-cache');
    localStorage.removeItem('movie-cache-timestamp');
    localStorage.removeItem('movie-cache-version');
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    return false;
  }
  return true;
};

// Admin function to force global cache update
export const incrementCacheVersion = (): void => {
  if (typeof window === 'undefined') return;
  
  const newVersion = `1.${Date.now()}`;
  localStorage.setItem(CACHE_VERSION_KEY, newVersion);
  // This will cause checkVersionCompatibility to clear cache on next visit
};

// Utility to clear all movie-related cache (for testing/admin)
export const clearAllMovieCache = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('movie-cache');
  localStorage.removeItem('movie-cache-timestamp');
  localStorage.removeItem('movie-cache-version');
  localStorage.removeItem(CACHE_VERSION_KEY);
};

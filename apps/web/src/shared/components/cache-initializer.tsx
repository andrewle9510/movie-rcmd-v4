"use client";

import { useEffect } from "react";

/**
 * CacheInitializer - Initialize cache on app startup
 * Currently a no-op but available for future cache initialization logic
 */
export function CacheInitializer() {
  useEffect(() => {
    // Cache initialization deferred to avoid blocking initial render
    // Future: Add cache versioning or cleanup logic here if needed
  }, []);

  return null;
}

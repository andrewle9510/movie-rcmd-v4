"use client";

import { useEffect } from "react";
import { initializeCacheVersion } from "@/lib/admin-cache";

export function CacheInitializer() {
  useEffect(() => {
    // Defer cache version check to avoid blocking initial render
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        initializeCacheVersion();
      });
    } else {
      // Fallback for older browsers
      setTimeout(() => {
        initializeCacheVersion();
      }, 100);
    }
  }, []);

  return null;
}

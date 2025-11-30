"use client";

import { useEffect } from "react";
import { initializeCacheVersion } from "@/lib/admin-cache";

export function CacheInitializer() {
  useEffect(() => {
    initializeCacheVersion();
  }, []);

  return null;
}

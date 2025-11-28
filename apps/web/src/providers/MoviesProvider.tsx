"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MoviesContextType {
  movies: any[] | undefined;
  isLoading: boolean;
  error: boolean;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: ReactNode }) {
  const movies = useQuery(api.api.getMovies);
  const isLoading = movies === undefined;
  const error = false; // Convex handles errors differently, but for simplicity

  return (
    <MoviesContext.Provider value={{ movies, isLoading, error }}>
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
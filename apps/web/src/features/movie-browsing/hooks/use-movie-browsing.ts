"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { transformMovieData } from "../utils/movie-utils";
import type { Movie } from "@/shared/types/movie";
import { useMemo } from "react";
import { useMoviesContext } from "@/shared/providers/MoviesProvider";

interface UseMoviesParams {
  searchQuery?: string;
  genreFilter?: string;
  limit?: number;
}

export function useMovies({ searchQuery, genreFilter, limit = 20 }: UseMoviesParams = {}) {
  const { movies: convexMovies, isLoading: convexLoading, error: convexError } = useMoviesContext();

  const { movies, isLoading, error } = useMemo(() => {
    if (convexMovies === undefined) {
      return { movies: undefined, isLoading: true, error: false };
    }

    if (!convexMovies || convexMovies.length === 0) {
      return { movies: [], isLoading: false, error: false };
    }

    try {
      const processedMovies: Movie[] = convexMovies.map(transformMovieData);

      let filteredMovies = processedMovies;

      if (searchQuery) {
        filteredMovies = filteredMovies.filter(movie =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (genreFilter) {
        const genreId = parseInt(genreFilter);
        if (!isNaN(genreId)) {
          filteredMovies = filteredMovies.filter(movie =>
            (movie as any).genres?.includes(genreId)
          );
        } else {
          filteredMovies = filteredMovies.filter(movie =>
            movie.genres.some((g: any) =>
              typeof g === 'string' && g.toLowerCase().includes(genreFilter.toLowerCase())
            )
          );
        }
      }

      if (limit) {
        filteredMovies = filteredMovies.slice(0, limit);
      }

      return { movies: filteredMovies, isLoading: false, error: false };
    } catch (err) {
      console.error("Error processing movie data:", err);
      return { movies: [], isLoading: false, error: true };
    }
  }, [convexMovies, searchQuery, genreFilter, limit]);

  const genres = useMemo(() => {
    if (!movies) return [];
    return [...new Set(movies.flatMap(m => m.genres))];
  }, [movies]);

  return {
    movies,
    genres,
    isLoading,
    error,
  };
}

export function useSeedMovies() {
  return {
    seedMovies: async () => {
      console.log("Seeding movies would happen here");
    },
  };
}

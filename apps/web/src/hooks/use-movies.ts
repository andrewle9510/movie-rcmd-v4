"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Movie } from "@/types/movie";
import { useMemo } from "react";

interface UseMoviesParams {
  searchQuery?: string;
  genreFilter?: string;
  limit?: number;
}

export function useMovies({ searchQuery, genreFilter, limit = 20 }: UseMoviesParams = {}) {
  const convexMovies = useQuery(api.api.getMovies);
  
  const { movies, isLoading, error } = useMemo(() => {
    if (convexMovies === undefined) {
      return { movies: undefined, isLoading: true, error: false };
    }

    if (!convexMovies || convexMovies.length === 0) {
      return { movies: [], isLoading: false, error: false };
    }

    try {
      const processedMovies: Movie[] = convexMovies.map((movie: any) => ({
        _id: movie._id,
        title: movie.title,
        description: movie.synopsis || movie.tagline || "No description available",
        posterUrl: movie.main_poster ? `https://image.tmdb.org/t/p/w500${movie.main_poster}` : undefined,
        releaseDate: movie.release_date,
        genres: movie.genres || [],
        rating: movie.vote_pts_system?.tmdb || undefined,
        duration: movie.runtime_minutes || undefined,
        director: undefined,
        cast: movie.cast || [],
        tmdbId: movie.tmdb_id,
      }));
      
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

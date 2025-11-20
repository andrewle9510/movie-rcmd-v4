import type { Movie } from "@/types/movie";

export function transformMovieData(movie: any): Movie {
  console.log("🔍 Raw movie data:", {
    title: movie.title,
    tmdb_id: movie.tmdb_id,
    main_poster: movie.main_poster,
    main_backdrop: movie.main_backdrop,
  });

  const posterUrl = movie.main_poster 
    ? `https://image.tmdb.org/t/p/w500${movie.main_poster.startsWith('/') ? '' : '/'}${movie.main_poster}`
    : undefined;
  
  const backdropUrl = movie.main_backdrop
    ? `https://image.tmdb.org/t/p/original${movie.main_backdrop.startsWith('/') ? '' : '/'}${movie.main_backdrop}`
    : undefined;

  console.log("🎬 Transformed URLs:", { 
    posterUrl, 
    backdropUrl,
    hasPoster: !!posterUrl,
    hasBackdrop: !!backdropUrl
  });

  return {
    _id: movie._id,
    title: movie.title,
    description: movie.synopsis || movie.tagline || "No description available",
    tagline: movie.tagline || undefined,
    posterUrl,
    backdropUrl,
    releaseDate: movie.release_date,
    genres: movie.genres || [],
    rating: movie.vote_pts_system?.tmdb || undefined,
    duration: movie.runtime_minutes || undefined,
    director: undefined,
    cast: movie.cast || [],
    tmdbId: movie.tmdb_id,
  };
}

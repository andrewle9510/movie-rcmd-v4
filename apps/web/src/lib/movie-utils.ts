import type { Movie } from "@/types/movie";

export function transformMovieData(movie: any): Movie {
  // Ensure main_poster and main_backdrop are strings before using them
  const mainPoster = typeof movie.main_poster === 'string' ? movie.main_poster : undefined;
  const mainBackdrop = typeof movie.main_backdrop === 'string' ? movie.main_backdrop : undefined;

  const posterUrl = mainPoster 
    ? `https://image.tmdb.org/t/p/w500${mainPoster.startsWith('/') ? '' : '/'}${mainPoster}`
    : undefined;
  
  const backdropUrl = mainBackdrop
    ? `https://image.tmdb.org/t/p/original${mainBackdrop.startsWith('/') ? '' : '/'}${mainBackdrop}`
    : undefined;

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
    screenshotUrl: movie.screenshot_url || undefined,
    screenshotIdList: movie.screenshot_id_list || undefined,
  };
}

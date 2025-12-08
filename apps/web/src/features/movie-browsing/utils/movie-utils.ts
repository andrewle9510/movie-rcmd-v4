import type { Movie } from "@/shared/types/movie";

interface CrewMember {
  crew_id: number;
  crew_name: string;
  crew_type: string;
}

export function transformMovieData(movie: any, crewData?: CrewMember[]): Movie {
  // Ensure main_poster and main_backdrop are strings before using them
  const mainPoster = typeof movie.main_poster === 'string' ? movie.main_poster : undefined;
  const mainBackdrop = typeof movie.main_backdrop === 'string' ? movie.main_backdrop : undefined;

  const posterUrl = mainPoster 
    ? `https://image.tmdb.org/t/p/w500${mainPoster.startsWith('/') ? '' : '/'}${mainPoster}`
    : undefined;
  
  const backdropUrl = mainBackdrop
    ? `https://image.tmdb.org/t/p/original${mainBackdrop.startsWith('/') ? '' : '/'}${mainBackdrop}`
    : undefined;

  // Map director IDs to names from crew data, filtering by crew_type
  const directorNames = crewData && Array.isArray(crewData)
    ? (movie.directors || [])
        .map((directorId: number) => {
          const crew = crewData.find(c => c.crew_id === directorId && c.crew_type === "Director");
          return crew?.crew_name;
        })
        .filter(Boolean) // Remove undefined entries
    : [];

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
    directorNames: directorNames.length > 0 ? directorNames : undefined,
    cast: movie.cast || [],
    tmdbId: movie.tmdb_id,
    screenshotUrl: movie.screenshot_url || undefined,
    screenshotIdList: movie.screenshot_id_list || undefined,
  };
}

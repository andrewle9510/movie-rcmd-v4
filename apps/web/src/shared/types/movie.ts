export interface Movie {
  _id: string;
  title: string;
  description: string;
  posterUrl?: string;
  backdropUrl?: string;
  tagline?: string;
  releaseDate: string;
  genres: string[];
  rating?: number;
  duration?: number;
  director?: string;
  cast?: string[];
  tmdbId?: number;
  screenshotUrl?: string;
  screenshotIdList?: string[];
}

export interface MovieSearchParams {
  searchQuery?: string;
  genreFilter?: string;
  limit?: number;
}

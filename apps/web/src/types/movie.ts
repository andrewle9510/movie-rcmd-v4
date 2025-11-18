export interface Movie {
  _id: string;
  title: string;
  description: string;
  posterUrl?: string;
  releaseDate: string;
  genres: string[];
  rating?: number;
  duration?: number;
  director?: string;
  cast?: string[];
  tmdbId?: number;
}

export interface MovieSearchParams {
  searchQuery?: string;
  genreFilter?: string;
  limit?: number;
}

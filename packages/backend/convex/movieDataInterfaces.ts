/**
 * Interface definitions for movie data structures
 * Separating TMDB API response structure from our database structure
 */

// TMDB API Response Interface
export interface TmdbMovieResponse {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  popularity: number;
  status: string;
  budget: number;
  revenue: number;
  imdb_id: string;
  poster_path: string;
  backdrop_path: string;
  homepage: string;
  tagline: string;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  production_companies: Array<{
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  credits?: {
    cast: Array<{ id: number; name: string; character: string; order: number }>;
    crew: Array<{ id: number; name: string; job: string; department: string }>;
  };
  videos?: {
    results: Array<{
      id: string;
      iso_639_1: string;
      iso_3166_1: string;
      key: string;
      name: string;
      site: string;
      size: number;
      type: string;
    }>;
  };
  keywords?: {
    keywords: Array<{ id: number; name: string }>;
  };
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
        release_date: string;
        type: number;
      }>;
    }>;
  };
  images?: {
    backdrops: Array<{
      aspect_ratio: number;
      height: number;
      iso_639_1: string | null;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;
    posters: Array<{
      aspect_ratio: number;
      height: number;
      iso_639_1: string | null;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;
  };
}

// Our database structure for Convex (normalized format)
export interface DbMovieStructure {
  title: string;
  original_title: string;
  slug: string;
  synopsis: string;
  tagline: string;
  belong_to_collection: any;
  popularity: number;
  status: string;
  release_date: string;
  runtime_minutes: number;
  directors: number[];
  cast: number[];
  production_studio: number[];
  country: string[];
  genres: number[];
  mood: number[];
  keywords: number[];
  original_language: string;
  language: string[];
  mpaa_rating: string;
  vote_pts_system: {
    tmdb: number;
    imdb: number | null;
    letterboxd: number | null;
    rotten_tomatoes: number | null;
    metacritic: number | null;
  };
  vote_count_system: {
    tmdb: number;
    imdb: number | null;
    letterboxd: number | null;
    rotten_tomatoes: number | null;
    metacritic: number | null;
  };
  budget: number;
  revenue: number;
  tmdb_id: number;
  tmdb_data_imported_at: string;
  imdb_id: string;
  screenshots: string[];
  screenshot_id_list?: string[];
  screenshot_url?: string;
  trailer_url: string;
  main_poster: string | undefined;
  main_backdrop: string | undefined;
  created_at: string;
  updated_at: string;
}

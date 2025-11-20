"use client";

import { useMovie } from "@/hooks/use-movie";
import { useParams } from "next/navigation";
import Image from "next/image";
import { MovieDetailUIConfig } from "@/config/movie-detail-ui-config";
import { MovieDetailImageConfig } from "@/config/movie-detail-backdrop-poster-config";

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.movieId as string;
  const { movie, isLoading, error } = useMovie(movieId);

  if (isLoading) return <div className="container py-10 text-center">Loading...</div>;
  if (!movie) return <div className="container py-10 text-center">Movie not found</div>;

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;

  // Determine flex direction based on config
  const flexDirection = MovieDetailUIConfig.poster.position === 'right' 
    ? 'md:flex-row-reverse' 
    : 'md:flex-row';

  // Resolve configured images
  const imageConfig = movie.tmdbId ? MovieDetailImageConfig[movie.tmdbId] : undefined;

  // Resolve Poster URL
  let activePosterUrl = movie.posterUrl;
  if (imageConfig?.posterIndex !== undefined && movie.posters && movie.posters[imageConfig.posterIndex]) {
    const posterPath = movie.posters[imageConfig.posterIndex];
    activePosterUrl = `https://image.tmdb.org/t/p/w500${posterPath.startsWith('/') ? '' : '/'}${posterPath}`;
  }

  // Resolve Backdrop URL
  let activeBackdropUrl = movie.backdropUrl;
  if (imageConfig?.backdropIndex !== undefined && movie.backdrops && movie.backdrops[imageConfig.backdropIndex]) {
    const backdropPath = movie.backdrops[imageConfig.backdropIndex];
    activeBackdropUrl = `https://image.tmdb.org/t/p/original${backdropPath.startsWith('/') ? '' : '/'}${backdropPath}`;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* 1. TOP BACKDROP SECTION - Taller & Cinematic */}
      <div 
        className="relative w-full bg-muted overflow-hidden"
        style={{ height: MovieDetailUIConfig.layout.backdropHeight }}
      >
        {activeBackdropUrl && (
          <>
            <Image 
              src={activeBackdropUrl} 
              alt={`${movie.title} backdrop`}
              fill 
              className="object-cover opacity-50" 
              priority 
              unoptimized
            />
            {/* Gradient for smooth transition to page background */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </>
        )}
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      {/* 
          Restored Cinematic Layout:
          - Overlaps the banner
          - Standard container padding
          - Standard max-width
      */}
      <div 
        className="container mx-auto px-4 md:px-8 relative z-10"
        style={{ marginTop: MovieDetailUIConfig.layout.contentNegativeMargin }}
      >
        
        {/* 
            STRICT ROW LAYOUT
            - Flex row to keep Poster and Content side-by-side
            - Gap controlled by config
        */}
        <div 
          className={`flex flex-col ${flexDirection} items-start`}
          style={{ gap: MovieDetailUIConfig.layout.gap }}
        >
          
          {/* POSTER COLUMN */}
          {/* Fixed width to prevent shrinking/growing */}
          <div 
            className="shrink-0"
            style={{ width: MovieDetailUIConfig.poster.width }}
          >
            <div 
              className="relative rounded-lg overflow-hidden bg-muted shadow-2xl border-4 border-white/10"
              style={{ aspectRatio: MovieDetailUIConfig.poster.aspectRatio }}
            >
              {activePosterUrl ? (
                <Image
                  src={activePosterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground bg-card">
                  No Poster
                </div>
              )}
            </div>
          </div>

          {/* CONTENT COLUMN */}
          {/* Added top padding (pt-4) to align nicely with poster top */}
          <div className="flex-1 pt-4 text-foreground">
            
            {/* HEADER: Title + Year */}
            {/* Text-shadow added to ensure readability over backdrop if it overlaps */}
            <h1 className="text-5xl font-bold font-serif tracking-tight text-white drop-shadow-lg mb-2">
              {movie.title}
              {releaseYear && <span className="text-white/80 font-sans font-normal ml-3 text-4xl">({releaseYear})</span>}
            </h1>

            {/* METADATA ROW */}
            <div className="flex flex-wrap items-center gap-3 mt-4 mb-8 text-sm font-medium text-foreground/80 uppercase tracking-wide">
              {movie.duration && (
                <>
                  <span className="bg-black/20 px-2 py-1 rounded backdrop-blur-sm text-white border border-white/10">
                    {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                  </span>
                </>
              )}
              {movie.genres.slice(0, 3).map((genre) => (
                <span key={genre} className="bg-black/20 px-2 py-1 rounded backdrop-blur-sm text-white border border-white/10">
                  {genre}
                </span>
              ))}
            </div>

            {/* TAGLINE */}
            {movie.tagline && (
              <p className="text-xl text-foreground/70 italic font-serif mb-10 border-l-4 border-primary/40 pl-4">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* SYNOPSIS SECTION */}
            <div className="mb-12 max-w-3xl">
              <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-4">Synopsis</h3>
              <p className="text-lg leading-loose text-foreground/90 font-serif">
                {movie.description}
              </p>
            </div>

            {/* STATS GRID */}
            <div className="border-t border-border/40 pt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <span className="block text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">Rating</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>
              
              <div>
                <span className="block text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">Released</span>
                <span className="text-lg text-foreground/90">
                  {new Date(movie.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMovie } from "@/features/movie-detail/hooks/use-movie-detail";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MovieDetailUIConfig } from "@/features/movie-detail/utils/movie-detail-ui-config";
import { MovieDetailImageConfig } from "@/features/movie-detail/utils/movie-detail-backdrop-poster-config";
import { BackdropCarouselControls } from "@/features/movie-browsing/components/backdrop-carousel-controls";

const fadeInStyles = `
  @keyframes fadeIn {
    from {
      opacity: var(--loading-opacity);
    }
    to {
      opacity: 1;
    }
  }
  .backdrop-image-loading {
    animation: fadeIn var(--transition-duration) ease-in;
  }
  .backdrop-image-exit {
    animation: fadeIn var(--transition-duration) ease-out reverse;
  }
`;


export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.movieId as string;
  const result = useMovie(movieId);
  const { movie, isLoading, error } = result;
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  console.log("🎬 MovieDetailPage render, movie:", movie?.title, "isLoading:", isLoading);

  if (error) {
    return (
      <div className="container py-10 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading movie: {error}
        </div>
      </div>
    );
  }

  if (!movie && !isLoading) {
    return <div className="container py-10 text-center">Movie not found</div>;
  }

  const releaseYear = movie?.releaseDate ? new Date(movie?.releaseDate).getFullYear() : null;

  // Screenshot carousel logic
  const hasScreenshots = movie?.screenshotIdList && movie.screenshotIdList.length > 0;
  const screenshotCount = movie?.screenshotIdList?.length || 0;

  const buildScreenshotUrl = (index: number): string => {
    // Index 0 is the main backdrop
    if (index === 0) {
      return movie?.backdropUrl || '';
    }
    // Indices 1+ are screenshots (offset by 1 in the array)
    if (!movie?.screenshotUrl || !movie.screenshotIdList || !movie.screenshotIdList[index - 1]) {
      return '';
    }
    const relativePath = movie.screenshotUrl.replace('{screenshot_id}', movie.screenshotIdList[index - 1]);
    return `https://screenmusings.org/movie${relativePath}`;
  };

  const totalImages = screenshotCount + 1; // +1 for main backdrop at index 0

  const handleNextScreenshot = () => {
    if (hasScreenshots || movie?.backdropUrl) {
      // Cycle through indices 0 to screenshotCount (0 is backdrop, 1-10 are screenshots)
      setCurrentScreenshotIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const handlePreviousScreenshot = () => {
    if (hasScreenshots || movie?.backdropUrl) {
      // Cycle backwards through all indices
      setCurrentScreenshotIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  // Reset screenshot index when movie changes
  useEffect(() => {
    setCurrentScreenshotIndex(0);
    setImageLoaded(false);
  }, [movieId]);

  // Store previous image URL for cross-fade
  const [prevDisplayUrl, setPrevDisplayUrl] = useState<string>('');

  // Reset imageLoaded when index changes and save previous URL
  useEffect(() => {
    // Save the current displayUrl before clearing loaded state
    if (!imageLoaded) return; // Only update if previous image was fully loaded
    setImageLoaded(false);
  }, [currentScreenshotIndex]);

  // Keyboard navigation for screenshots
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasScreenshots) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousScreenshot();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextScreenshot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasScreenshots, screenshotCount, handleNextScreenshot, handlePreviousScreenshot]);

  // currentScreenshotIndex is 0-10: index 0 is backdrop, indices 1-10 are screenshots
  // Display the image at current index
  const displayUrl = buildScreenshotUrl(currentScreenshotIndex);
  
  // Preload next and previous images
  const nextIndex = (currentScreenshotIndex + 1) % totalImages;
  const prevIndex = (currentScreenshotIndex - 1 + totalImages) % totalImages;
  const nextUrl = buildScreenshotUrl(nextIndex);
  const prevUrl = buildScreenshotUrl(prevIndex);
  
  // Preload images using effect
  useEffect(() => {
    const preloadImage = (url: string) => {
      if (!url) return;
      const img = globalThis.Image ? new globalThis.Image() : undefined;
      if (img) {
        img.src = url;
      }
    };
    preloadImage(nextUrl);
    preloadImage(prevUrl);
  }, [nextUrl, prevUrl]);

  // Update prevDisplayUrl to current image when it loads
  useEffect(() => {
    if (imageLoaded && displayUrl && displayUrl !== prevDisplayUrl) {
      setPrevDisplayUrl(displayUrl);
    }
  }, [displayUrl, imageLoaded, prevDisplayUrl]);

  // Determine flex direction based on config
  const flexDirection = MovieDetailUIConfig.poster.position === 'right' 
    ? 'md:flex-row-reverse' 
    : 'md:flex-row';

  // Resolve configured images
  const imageConfig = movie?.tmdbId ? MovieDetailImageConfig[movie.tmdbId] : undefined;

  // Resolve Poster URL
  let activePosterUrl = movie?.posterUrl || '';
  if (imageConfig?.posterFilepath) {
    // Use manual file path if provided
    const posterPath = imageConfig.posterFilepath;
    activePosterUrl = `https://image.tmdb.org/t/p/w500${posterPath.startsWith('/') ? '' : '/'}${posterPath}`;
  }

  // Display current image (index 0 is backdrop, indices 1-10 are screenshots)
  let activeBackdropUrl = displayUrl || movie?.backdropUrl || '';
  if (imageConfig?.backdropFilepath && !displayUrl) {
    // Use manual file path only if no displayUrl available
    const backdropPath = imageConfig.backdropFilepath;
    activeBackdropUrl = `https://image.tmdb.org/t/p/original${backdropPath.startsWith('/') ? '' : '/'}${backdropPath}`;
  }

  // Update imageLoaded when new image loads
  const handleImageLoadingComplete = () => {
    setImageLoaded(true);
  };

  // Resolve Backdrop Gradient
  const gradientConfig = MovieDetailUIConfig.backdrop.bottomFade;
  let gradientClasses = "";
  if (gradientConfig.enabled) {
    const intensityMap = {
      soft: "via-background/30",
      medium: "via-background/60",
      hard: "via-background/90",
    };
    // @ts-ignore - Configuring via map lookup
    const viaClass = intensityMap[gradientConfig.intensity] || intensityMap.medium;
    gradientClasses = `bg-gradient-to-t from-background ${viaClass} to-transparent`;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <style>{fadeInStyles}</style>
      {/* Movie content - rendered when movie data is available */}
      {movie && (
        <>
        {/* 1. TOP BACKDROP SECTION - Taller & Cinematic */}
      <div 
        className="relative w-full bg-muted overflow-hidden"
        style={{ height: MovieDetailUIConfig.layout.backdropHeight }}
      >
        {(activeBackdropUrl || prevDisplayUrl) && (
          <>
            {/* Previous image (fading out) */}
            {prevDisplayUrl && prevDisplayUrl !== activeBackdropUrl && !imageLoaded && (
              <Image 
                src={prevDisplayUrl} 
                alt="previous"
                fill 
                className="object-cover backdrop-image-exit"
                style={{ 
                  opacity: MovieDetailUIConfig.backdrop.opacity,
                  zIndex: 1,
                  '--transition-duration': MovieDetailUIConfig.backdrop.screenshotTransitionDuration,
                } as React.CSSProperties & { '--transition-duration': string }}
                unoptimized
              />
            )}
            
            {/* Current image (fading in) */}
            {activeBackdropUrl && (
              <Image 
                key={`backdrop-${currentScreenshotIndex}`}
                src={activeBackdropUrl} 
                alt={`${movie.title} backdrop`}
                fill 
                className={`object-cover ${imageLoaded ? 'backdrop-image-loading' : ''}`}
                style={{ 
                  opacity: imageLoaded ? MovieDetailUIConfig.backdrop.opacity : MovieDetailUIConfig.backdrop.loadingOpacity,
                  zIndex: 2,
                  '--loading-opacity': MovieDetailUIConfig.backdrop.loadingOpacity,
                  '--transition-duration': MovieDetailUIConfig.backdrop.screenshotTransitionDuration,
                } as React.CSSProperties & { '--loading-opacity': number; '--transition-duration': string }}
                priority 
                unoptimized
                onLoadingComplete={handleImageLoadingComplete}
              />
            )}
            {/* Gradient for smooth transition to page background */}
            {gradientConfig.enabled && (
              <div 
                className={`absolute bottom-0 left-0 right-0 ${gradientClasses}`}
                style={{ height: gradientConfig.height, zIndex: 3 }}
              />
            )}
            {/* Carousel controls (1/11 = backdrop + 10 screenshots) */}
            <BackdropCarouselControls
              onPrevious={handlePreviousScreenshot}
              onNext={handleNextScreenshot}
              currentIndex={currentScreenshotIndex + 1}
              totalCount={totalImages}
              show={!!(hasScreenshots || movie?.backdropUrl)}
            />
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
        </>
      )}
    </div>
  );
}

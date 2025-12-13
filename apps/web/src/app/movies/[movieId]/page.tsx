"use client";

import { useMovie } from "@/hooks/use-movie-detail";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MovieDetailUIConfig, PosterPosition } from "@/config/movie-detail-ui-config";
import { MovieDetailImageConfig } from "@/config/movie-detail-backdrop-poster-config";
import { BackdropCarouselControls } from "@/components/backdrop-carousel-controls";
import { getPeopleFromCache, savePeopleToCache } from "@/lib/people-cache";

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
  const directorIds = movie?.directorIds || [];
  const cachedDirectorsMap = directorIds.length > 0 ? getPeopleFromCache(directorIds) : {};
  const directorsPeople = useQuery(
    api.people.getPeopleByTmdbIds,
    directorIds.length > 0 ? { ids: directorIds } : "skip"
  );
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Resolve configured images
  const imageConfig = movie?.tmdbId ? MovieDetailImageConfig[Number(movie.tmdbId)] : undefined;

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

  useEffect(() => {
    if (directorsPeople && Array.isArray(directorsPeople) && directorsPeople.length > 0) {
      savePeopleToCache(directorsPeople);
    }
  }, [directorsPeople]);

  const directorNames = directorIds.length > 0
    ? directorIds
        .map((id) => cachedDirectorsMap[id]?.name || directorsPeople?.find((p: any) => p.tmdb_person_id === id)?.name)
        .filter(Boolean)
    : [];

  const shouldShowDirectorPlaceholder = directorIds.length > 0 && directorNames.length === 0 && directorsPeople === undefined;

  // Screenshot carousel logic
  const hasScreenshots = movie?.screenshotIdList && movie.screenshotIdList.length > 0;
  const screenshotCount = movie?.screenshotIdList?.length || 0;

  const buildCarouselUrl = (index: number): string => {
    // Index 0 is the main backdrop
    if (index === 0) {
      if (imageConfig?.backdropFilepath) {
        const backdropPath = imageConfig.backdropFilepath;
        return `https://image.tmdb.org/t/p/original${backdropPath.startsWith('/') ? '' : '/'}${backdropPath}`;
      }
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
  const displayUrl = buildCarouselUrl(currentScreenshotIndex);

  // Preload next and previous images
  const nextIndex = (currentScreenshotIndex + 1) % totalImages;
  const prevIndex = (currentScreenshotIndex - 1 + totalImages) % totalImages;
  const nextUrl = buildCarouselUrl(nextIndex);
  const prevUrl = buildCarouselUrl(prevIndex);

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
  const posterPosition: PosterPosition = MovieDetailUIConfig.poster.position;
  const flexDirection = posterPosition === PosterPosition.RIGHT
    ? 'md:flex-row-reverse'
    : 'md:flex-row';

  // Resolve Poster URL
  let activePosterUrl = movie?.posterUrl || '';
  if (imageConfig?.posterFilepath) {
    // Use manual file path if provided
    const posterPath = imageConfig.posterFilepath;
    activePosterUrl = `https://image.tmdb.org/t/p/w500${posterPath.startsWith('/') ? '' : '/'}${posterPath}`;
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

  const mockParagraph =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

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
        {(displayUrl || prevDisplayUrl) && (
          <>
            {/* Previous image (fading out) */}
            {prevDisplayUrl && prevDisplayUrl !== displayUrl && !imageLoaded && (
              <Image
                src={prevDisplayUrl}
                alt="previous"
                fill
                sizes="100vw"
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
            {displayUrl && (
              <Image
                key={`backdrop-${currentScreenshotIndex}`}
                src={displayUrl}
                alt={`${movie.title} backdrop`}
                fill
                sizes="100vw"
                className={`object-cover ${imageLoaded ? 'backdrop-image-loading' : ''}`}
                style={{
                  opacity: imageLoaded ? MovieDetailUIConfig.backdrop.opacity : MovieDetailUIConfig.backdrop.loadingOpacity,
                  zIndex: 2,
                  '--loading-opacity': MovieDetailUIConfig.backdrop.loadingOpacity,
                  '--transition-duration': MovieDetailUIConfig.backdrop.screenshotTransitionDuration,
                } as React.CSSProperties & { '--loading-opacity': number; '--transition-duration': string }}
                priority
                loading="eager"
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
            className={`shrink-0 ${
              MovieDetailUIConfig.poster.sticky?.enabled
                ? "md:sticky md:self-start md:top-[var(--poster-sticky-top)] md:max-h-[calc(100vh-var(--poster-sticky-top))]"
                : ""
            }`}
            style={
              {
                width: MovieDetailUIConfig.poster.width,
                ...(MovieDetailUIConfig.poster.sticky?.enabled
                  ? ({ "--poster-sticky-top": MovieDetailUIConfig.poster.sticky.topOffset } as React.CSSProperties)
                  : {}),
              } as React.CSSProperties & { "--poster-sticky-top"?: string }
            }
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
                  sizes="(max-width: 768px) 100vw, 280px"
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
            <h1
              className={`drop-shadow-lg mb-2 ${MovieDetailUIConfig.headers.title.color}`}
              style={{
                fontFamily: MovieDetailUIConfig.headers.title.fontFamily,
                fontSize: MovieDetailUIConfig.headers.title.fontSize,
                fontWeight: MovieDetailUIConfig.headers.title.fontWeight,
                lineHeight: MovieDetailUIConfig.headers.title.lineHeight,
                letterSpacing: MovieDetailUIConfig.headers.title.letterSpacing,
              }}
            >
              {movie.title}
              {releaseYear && (
                <span
                  className={`ml-3 ${MovieDetailUIConfig.headers.releaseYear.color}`}
                  style={{
                    fontFamily: MovieDetailUIConfig.headers.releaseYear.fontFamily,
                    fontSize: MovieDetailUIConfig.headers.releaseYear.fontSize,
                    fontWeight: MovieDetailUIConfig.headers.releaseYear.fontWeight,
                    lineHeight: MovieDetailUIConfig.headers.releaseYear.lineHeight,
                    letterSpacing: MovieDetailUIConfig.headers.releaseYear.letterSpacing,
                  }}
                >
                  ({releaseYear})
                </span>
              )}
            </h1>

            {/* DIRECTORS - GENRE - DURATION ON SAME LINE */}
            {(directorNames.length > 0 || shouldShowDirectorPlaceholder || movie.duration) && (
              <p className={MovieDetailUIConfig.directors.dropShadow} style={{
                marginBottom: MovieDetailUIConfig.genre.marginBottom,
                fontFamily: MovieDetailUIConfig.directors.fontFamily,
                fontSize: MovieDetailUIConfig.directors.fontSize,
                fontWeight: MovieDetailUIConfig.directors.fontWeight,
              }}>
                {/* Directors */}
                {shouldShowDirectorPlaceholder && (
                  <>
                    <span className={MovieDetailUIConfig.directors.prefix.color}>
                      {MovieDetailUIConfig.directors.prefix.text}{" "}
                    </span>…
                  </>
                )}
                {directorNames.length > 0 && (
                  <>
                    <span className={MovieDetailUIConfig.directors.prefix.color}>
                      {MovieDetailUIConfig.directors.prefix.text}{" "}
                    </span>
                    <span className={MovieDetailUIConfig.directors.color}>
                      {directorNames.join(", ")}
                    </span>
                  </>
                )}

                {/* Genre - show first genre only */}
                {movie.genres && movie.genres.length > 0 && (
                  <>
                    <span style={{ margin: `0 ${MovieDetailUIConfig.genre.separator.length > 0 ? '0.25rem' : 0}` }}>
                      {MovieDetailUIConfig.genre.separator}
                    </span>
                    <span className={MovieDetailUIConfig.genre.color}>
                      {movie.genres[0]}
                    </span>
                  </>
                )}

                {/* Duration */}
                {movie.duration && (
                  <>
                    <span style={{ margin: `0 ${MovieDetailUIConfig.genre.separator.length > 0 ? '0.25rem' : 0}` }}>
                      {MovieDetailUIConfig.genre.separator}
                    </span>
                    <span className={MovieDetailUIConfig.duration.color}>
                      {Math.floor(movie.duration / 60)}h{(movie.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </>
                )}
              </p>
            )}

            {/* TAGLINE */}
            {movie.tagline && (
              <p
                className={`mb-4 ${MovieDetailUIConfig.tagline.color}`}
                style={{
                  fontFamily: MovieDetailUIConfig.tagline.fontFamily,
                  fontSize: MovieDetailUIConfig.tagline.fontSize,
                  fontWeight: MovieDetailUIConfig.tagline.fontWeight,
                  lineHeight: MovieDetailUIConfig.tagline.lineHeight,
                  fontStyle: MovieDetailUIConfig.tagline.fontStyle,
                  marginBottom: MovieDetailUIConfig.tagline.marginBottom,
                }}
              >
                {movie.tagline}
              </p>
            )}

            {/* SYNOPSIS SECTION */}
            <div className="mb-12">
              <p
                className={`${MovieDetailUIConfig.description.color}`}
                style={{
                  fontFamily: MovieDetailUIConfig.description.fontFamily,
                  fontSize: MovieDetailUIConfig.description.fontSize,
                  fontWeight: MovieDetailUIConfig.description.fontWeight,
                  lineHeight: MovieDetailUIConfig.description.lineHeight,
                  maxWidth: MovieDetailUIConfig.description.maxWidth,
                }}
              >
                {movie.description}
              </p>
            </div>

            {/* TEMP: mock content for testing sticky poster */}
            {MovieDetailUIConfig.debug?.mockLongContent?.enabled && (
              <section className="pb-24" aria-label="Mock content">
                <h2 className="text-white text-xl font-semibold mb-4">Mock Content</h2>
                <div className="space-y-6" style={{ maxWidth: MovieDetailUIConfig.description.maxWidth }}>
                  {Array.from({ length: MovieDetailUIConfig.debug.mockLongContent.paragraphs }).map((_, i) => (
                    <p
                      key={i}
                      className={`${MovieDetailUIConfig.description.color}`}
                      style={{
                        fontFamily: MovieDetailUIConfig.description.fontFamily,
                        fontSize: MovieDetailUIConfig.description.fontSize,
                        fontWeight: MovieDetailUIConfig.description.fontWeight,
                        lineHeight: MovieDetailUIConfig.description.lineHeight,
                      }}
                    >
                      {mockParagraph}
                    </p>
                  ))}
                </div>
              </section>
            )}



          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

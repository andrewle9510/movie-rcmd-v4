import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieDetailUIConfig } from "../../features/movie-detail/utils/movie-detail-ui-config";

interface BackdropCarouselControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
  show: boolean;
}

export function BackdropCarouselControls({
  onPrevious,
  onNext,
  currentIndex,
  totalCount,
  show,
}: BackdropCarouselControlsProps) {
  if (!show) return null;

  const config = MovieDetailUIConfig.carouselControls;

  // Convert bg-color/opacity to rgba
  const parseBackgroundColor = (bgClass: string): string => {
    // bg-black/40 -> rgba(0, 0, 0, 0.4)
    // bg-white/40 -> rgba(255, 255, 255, 0.4)
    if (bgClass.includes('bg-black')) {
      const opacity = bgClass.match(/\/(\d+)/)?.[1] || '100';
      return `rgba(0, 0, 0, ${parseInt(opacity) / 100})`;
    } else if (bgClass.includes('bg-white')) {
      const opacity = bgClass.match(/\/(\d+)/)?.[1] || '100';
      return `rgba(255, 255, 255, ${parseInt(opacity) / 100})`;
    }
    return 'transparent';
  };

  const idleBackground = parseBackgroundColor(config.backgroundColor);
  const hoverBackground = parseBackgroundColor(config.hoverBackgroundColor);

  return (
    <>
      {/* Left button - positioned at bottom-left */}
      <button
        onClick={onPrevious}
        className="absolute z-20 rounded-full backdrop-blur-sm transition-colors duration-150 cursor-pointer group"
        style={{
          bottom: config.position.bottom,
          left: config.position.sides,
          padding: config.padding,
          backgroundColor: idleBackground,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBackground)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idleBackground)}
        aria-label="Previous screenshot"
        title={`Previous screenshot (${currentIndex}/${totalCount})`}
      >
        <ChevronLeft
          style={{
            width: config.size,
            height: config.size,
          }}
          className={config.iconColor}
        />
      </button>

      {/* Right button - positioned at bottom-right */}
      <button
        onClick={onNext}
        className="absolute z-20 rounded-full backdrop-blur-sm transition-colors duration-150 cursor-pointer group"
        style={{
          bottom: config.position.bottom,
          right: config.position.sides,
          padding: config.padding,
          backgroundColor: idleBackground,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBackground)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idleBackground)}
        aria-label="Next screenshot"
        title={`Next screenshot (${currentIndex + 1}/${totalCount})`}
      >
        <ChevronRight
          style={{
            width: config.size,
            height: config.size,
          }}
          className={config.iconColor}
        />
      </button>
    </>
  );
}

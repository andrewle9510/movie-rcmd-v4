import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types/movie";
import { MovieCardSkeleton } from "./movie-card-skeleton";
import { UIConfig } from "@/config/movie-browsing-ui-config";

export type GridSize = "small" | "medium" | "large";

interface MovieCardProps {
  movie: Movie;
  gridSize?: GridSize;
  viewMode?: "grid" | "list";
  onAddToWatchlist?: (movieId: string) => void;
}

export function MovieCard({ movie, gridSize = "medium", viewMode = "grid", onAddToWatchlist }: MovieCardProps) {
  const getCardStyles = () => {
    const baseStyles = {
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem", 
      overflow: "hidden",
      transition: "box-shadow 0.3s ease",
      cursor: "pointer",
      display: "block",
      textDecoration: "none",
      color: "inherit"
    } as React.CSSProperties;
    
    if (viewMode === "list") {
      return {
        ...baseStyles,
        display: "flex",
        flexDirection: "row" as const,
        marginBottom: "1rem",
        maxWidth: "100%"
      };
    }
    
    // Update movie card to have flexible, viewport-based dimensions
    if (viewMode === "grid") {
       return {
         ...baseStyles,
         width: "100%"
       };
    }
    
    return baseStyles;
  };

  const getImageContainerStyles = () => {
    if (viewMode === "list") {
      return {
        position: "relative" as const,
        width: "6rem",
        height: "9rem",
        flexShrink: 0,
        overflow: "hidden"
      };
    }
    
    return {
      position: "relative" as const,
      width: "100%",
      paddingTop: UIConfig.card.aspectRatio,
      overflow: "hidden"
    };
  };

  const getImageStyles = () => ({
    objectFit: "cover" as const,
    transition: "transform 0.3s ease",
    width: "100%",
    height: "100%"
  });

  const renderCardContent = () => {
    // Skip rendering content if globally disabled in config and not in list view
    if (!UIConfig.card.showInfo && viewMode !== "list") {
      return null;
    }

    const commonInfo = (
      <div style={{ 
        padding: gridSize === "small" ? UIConfig.card.padding.small : gridSize === "large" ? UIConfig.card.padding.large : UIConfig.card.padding.medium
      }}>
        <h3 style={{ 
          fontWeight: "bold",
          lineHeight: "1.25",
          marginBottom: UIConfig.card.infoSpacing,
          fontSize: viewMode === "list" ? "1rem" : 
                   gridSize === "small" ? "0.875rem" : 
                   gridSize === "large" ? "1.25rem" : 
                   "1.125rem",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden"
        }}>
          {movie.title}
        </h3>
        
        {UIConfig.card.showDescription && gridSize !== "small" && viewMode === "grid" && (
          <p style={{ 
            color: "#6b7280",
            fontSize: "0.875rem",
            marginBottom: "0.75rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden"
          }}>
            {movie.description}
          </p>
        )}
        
        {viewMode === "list" && (
          <p style={{ 
            fontSize: "0.875rem",
            color: "#6b7280",
            marginBottom: "0.75rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden"
          }}>
            {movie.description}
          </p>
        )}
        
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap" as const,
          gap: "0.25rem",
          marginBottom: "0.75rem"
        }}>
          {(viewMode === "list" 
            ? movie.genres.slice(0, 5)
            : movie.genres.slice(0, gridSize === "small" ? 2 : 3)
          ).map((genre, index) => (
            <span 
              key={index}
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                padding: "0.125rem 0.5rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                display: "inline-block"
              }}
            >
              {genre}
            </span>
          ))}
        </div>
        
        <div style={{ 
            display: "flex", 
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: viewMode === "list" || gridSize === "small" ? "0.75rem" : "0.875rem",
            fontSize: viewMode === "list" || gridSize === "small" ? "calc(12px + 0.4vw)" : gridSize === "large" ? "calc(14px + 0.4vw)" : "calc(10px + 0.4vw)"
          }}>
            <span style={{ color: "#6b7280" }}>
              {new Date(movie.releaseDate).getFullYear()}
            </span>
          {UIConfig.card.showRating && movie.rating && (
            <span style={{ 
              color: "#d97706",
              fontWeight: "500",
              display: "flex",
              alignItems: "center"
            }}>
              ⭐ {movie.rating.toFixed(1)}
            </span>
          )}
        </div>
        
        {UIConfig.card.showDuration && movie.duration && (
          <div style={{ 
            fontSize: "0.75rem", 
            color: "#6b7280",
            marginBottom: UIConfig.card.infoSpacing,
            display: "flex",
            alignItems: "center"
          }}>
            🕐 {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
          </div>
        )}
        
        {UIConfig.card.showWatchlistButton && (gridSize === "large" || viewMode === "list") && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToWatchlist?.(movie._id);
            }}
            style={{
              width: "100%",
              marginTop: UIConfig.card.infoSpacing,
              padding: "0.25rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              backgroundColor: "white",
              color: "#374151",
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem"
            }}
          >
            ❤️ Add to Watchlist
          </button>
        )}
      </div>
    );

    if (viewMode === "list") {
      return commonInfo;
    }

    return commonInfo;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(to bottom right, #e2e8f0, #cbd5e1);"><span style="color: #64748b; font-size: 0.875rem;">Poster not available</span></div>';
    }
  };

  return (
    <Link href={`/movies/${movie._id}`} style={getCardStyles()}>
      <div style={viewMode === "list" ? getImageContainerStyles() : {}}>
        <div style={getImageContainerStyles()}>
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill={viewMode !== "list"}
              width={viewMode === "list" ? 96 : undefined}
              height={viewMode === "list" ? 144 : undefined}
              style={viewMode === "list" ? getImageStyles() : undefined}
              sizes={viewMode === "list" ? "96px" : undefined}
              onError={handleImageError}
            />
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              background: "linear-gradient(to bottom right, #e2e8f0, #cbd5e1)",
            }}>
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>No poster</span>
            </div>
          )}
        </div>
      </div>
      {renderCardContent()}
    </Link>
  );
}

export { MovieCardSkeleton };

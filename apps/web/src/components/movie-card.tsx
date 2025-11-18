import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Movie } from "@/types/movie";

export type GridSize = "small" | "medium" | "large";

interface MovieCardProps {
  movie: Movie;
  gridSize?: GridSize;
  viewMode?: "grid" | "list";
}

export function MovieCard({ movie, gridSize = "medium", viewMode = "grid" }: MovieCardProps) {
  const getCardClasses = () => {
    if (viewMode === "list") {
      return "flex flex-row overflow-hidden transition-shadow hover:shadow-lg";
    }
    
    switch (gridSize) {
      case "small":
        return "overflow-hidden transition-shadow hover:shadow-lg";
      case "large":
        return "overflow-hidden transition-shadow hover:shadow-lg";
      default:
        return "overflow-hidden transition-shadow hover:shadow-lg";
    }
  };

  const getImageContainerClasses = () => {
    if (viewMode === "list") {
      return "relative w-24 h-36 flex-shrink-0 overflow-hidden";
    }
    
    switch (gridSize) {
      case "small":
        return "relative aspect-[2/3] overflow-hidden";
      case "large":
        return "relative aspect-[2/3] overflow-hidden";
      default:
        return "relative aspect-[2/3] overflow-hidden";
    }
  };

  const getImageSizes = () => {
    if (viewMode === "list") {
      return "96px";
    }
    
    switch (gridSize) {
      case "small":
        return "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";
      case "large":
        return "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";
      default:
        return "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";
    }
  };

  const renderCardContent = () => {
    const commonInfo = (
      <>
        <h3 className={`font-semibold leading-tight line-clamp-2 ${
          viewMode === "list" ? "text-base mb-1" : 
          gridSize === "small" ? "text-sm mb-1" : 
          gridSize === "large" ? "text-xl mb-3" : 
          "text-lg mb-2"
        }`}>
          {movie.title}
        </h3>
        
        {gridSize !== "small" && viewMode === "grid" && (
          <p className={`text-gray-600 line-clamp-3 ${
            gridSize === "large" ? "text-sm mb-3" : "text-sm mb-3"
          }`}>
            {movie.description}
          </p>
        )}

        {viewMode === "list" && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {movie.description}
          </p>
        )}
        
        <div className={`flex flex-wrap gap-1 ${
          viewMode === "list" ? "mb-2" : 
          gridSize === "small" ? "mb-2" : "mb-2"
        }`}>
          {(viewMode === "list" 
            ? movie.genres.slice(0, 5)
            : movie.genres.slice(0, gridSize === "small" ? 2 : 3)
          ).map((genre) => (
            <Badge 
              key={genre} 
              variant="secondary" 
              className={`${
                gridSize === "small" ? "text-xs" : "text-xs"
              }`}
            >
              {genre}
            </Badge>
          ))}
        </div>
        
        <div className={`flex items-center justify-between ${
          viewMode === "list" ? "text-xs" : gridSize === "small" ? "text-xs" : "text-xs"
        } text-gray-500`}>
          <span>{new Date(movie.releaseDate).getFullYear()}</span>
          {movie.rating && (
            <span className="flex items-center">
              ⭐ {movie.rating.toFixed(1)}
            </span>
          )}
        </div>
        
        {movie.duration && (
          <div className={`mt-1 text-xs text-gray-500 ${
            viewMode === "list" || gridSize === "small" ? "" : ""
          }`}>
            {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
          </div>
        )}
      </>
    );

    if (viewMode === "list") {
      return (
        <div className="flex-1 p-4">
          {commonInfo}
        </div>
      );
    }

    return (
      <CardContent className={`p-${gridSize === "small" ? "2" : gridSize === "large" ? "6" : "4"}`}>
        {commonInfo}
      </CardContent>
    );
  };

  return (
    <Card className={getCardClasses()}>
      <CardHeader className={viewMode === "list" ? "p-0" : "p-0"}>
        <div className={getImageContainerClasses()}>
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes={getImageSizes()}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <span className="text-gray-500">No poster</span>
            </div>
          )}
        </div>
      </CardHeader>
      {renderCardContent()}
    </Card>
  );
}

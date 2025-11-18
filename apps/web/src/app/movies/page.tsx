"use client";

import { useState, useEffect } from "react";
import { MovieCard, type GridSize } from "@/components/movie-card";
import { GridControls } from "@/components/grid-controls";
import { PaginationControls } from "@/components/pagination-controls";
import { useMovies } from "@/hooks/use-movies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 12;

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [gridSize, setGridSize] = useState<GridSize>("medium");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const { movies, genres, isLoading, error } = useMovies({
    searchQuery,
    genreFilter,
    limit: 100, // Get more items for pagination
  });

  const handleSeeding = async () => {
    try {
      // This would be handled through Convex mutations in a real implementation
      console.log("Seeding sample movies...");
    } catch (err) {
      console.error("Failed to seed movies:", err);
    }
  };

  const getGridCols = () => {
    if (viewMode === "list") {
      return "grid-cols-1";
    }

    switch (gridSize) {
      case "small":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, genreFilter]);

  // Calculate pagination
  const filteredMovies = movies || [];
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMovies = filteredMovies.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <h2 className="text-lg font-semibold">Error loading movies</h2>
          <p className="text-sm">
            There was a problem fetching the movie data.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Browse Movies</h1>
        <p className="text-gray-600">
          Discover and explore our collection of movies
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <GridControls
              gridSize={gridSize}
              viewMode={viewMode}
              onGridSizeChange={setGridSize}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-lg text-gray-600">Loading movies...</p>
            <p className="text-sm text-gray-500">
              Please wait while we fetch the latest movies
            </p>
          </div>
        </div>
      ) : paginatedMovies.length > 0 ? (
        <>
          <div
            className={`grid gap-${viewMode === "list" ? "4" : gridSize === "small" ? "4" : gridSize === "large" ? "6" : "6"} ${getGridCols()}`}
          >
            {paginatedMovies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                gridSize={gridSize}
                viewMode={viewMode}
              />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredMovies.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="mb-2 text-2xl font-semibold">No movies found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || genreFilter
                ? "Try adjusting your search or filter criteria to find what you're looking for."
                : "No movies are available in the database at the moment."}
            </p>
          </div>
          {!searchQuery && !genreFilter && (
            <div className="space-y-3">
              <Button onClick={handleSeeding} size="lg" className="px-8">
                Load Sample Movies
              </Button>
              <p className="text-sm text-gray-500">
                This will add some example movies to browse
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

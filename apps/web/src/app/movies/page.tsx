"use client";

import { useState, useEffect, useRef } from "react";
import { MovieCard, type GridSize } from "@/components/movie-card";
import { GridControls } from "@/components/grid-controls";
import { PaginationControls } from "@/components/pagination-controls";
import { useMovies } from "@/hooks/use-movie-browsing";
import { MovieBrowsingUIConfig } from "@/config/movie-browsing-ui-config";
import { useMoviesContext } from "@/providers/MoviesProvider";

const ITEMS_PER_PAGE = 12;

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gridSize, setGridSize] = useState<GridSize>("medium");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize page from storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('movie-page');
    if (stored) {
      const page = parseInt(stored, 10);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    }
  }, []);

  // Save page to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem('movie-page', currentPage.toString());
  }, [currentPage]);

  const { movies, isLoading, error } = useMovies({
    searchQuery,
    limit: 100, // Get more items for pagination
  });

  // Get cache functionality
  const { cacheStatus, forceRefresh } = useMoviesContext();

  // Calculate pagination
  const filteredMovies = movies || [];
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

  // Validate page number against totalPages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  const handleSeeding = async () => {
    try {
      // This would be handled through Convex mutations in a real implementation
      console.log("Seeding sample movies...");
    } catch (err) {
      console.error("Failed to seed movies:", err);
    }
  };

  const getGridStyles = () => {
    if (viewMode === "list") {
      return {
        display: "grid",
        width: "100%",
        gridTemplateColumns: "1fr",
        gap: MovieBrowsingUIConfig.grid.gap.medium
      };
    }

    const minWidth = gridSize === "small"
      ? MovieBrowsingUIConfig.grid.minColumnWidth.small
      : gridSize === "large"
        ? MovieBrowsingUIConfig.grid.minColumnWidth.large
        : MovieBrowsingUIConfig.grid.minColumnWidth.medium;

    return {
      display: "grid",
      width: "100%",
      gap: MovieBrowsingUIConfig.grid.gap.medium,
      gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`
    };
  };

  // Reset to page 1 when search changes from non-empty to different non-empty
  const prevSearchQuery = useRef(searchQuery);

  useEffect(() => {
    // Only reset when we had a previous search and it's different
    if (prevSearchQuery.current && prevSearchQuery.current !== searchQuery) {
      setCurrentPage(1);
    }
    prevSearchQuery.current = searchQuery;
  }, [searchQuery]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="text-lg font-bold mb-2">Error loading movies</h2>
          <p className="text-sm mb-2">There was a problem fetching the movie data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Browse Movies</h1>
        <p className="text-muted-foreground">Discover and explore our collection of movies</p>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="w-full sm:max-w-sm">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
          </div>
          <GridControls
            gridSize={gridSize}
            viewMode={viewMode}
            onGridSizeChange={setGridSize}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-foreground font-medium mb-2">Loading movies...</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch the latest movies</p>
        </div>
      ) : paginatedMovies.length > 0 ? (
        <>
          <div style={getGridStyles()}>
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
        <div className="text-center py-16 px-4">
          <div className="mb-6 text-5xl">🎬</div>
          <h3 className="text-xl font-bold mb-2 text-foreground">No movies found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery
              ? "Try adjusting your search criteria to find what you're looking for."
              : "No movies are available in the database at the moment."}
          </p>

          {!searchQuery && (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleSeeding}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium shadow-lg hover:bg-primary/90 transition-all"
              >
                Load Sample Movies
              </button>
              <p className="text-xs text-muted-foreground">This will add some example movies to browse</p>
            </div>
          )}
        </div>
      )}

      {/* Force Update Section */}
      <div className="mt-16 flex flex-col items-center justify-center gap-1 pt-4">
        <button
          onClick={forceRefresh}
          disabled={isLoading}
          className="text-xs text-muted-foreground hover:text-foreground/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "Updating..." : "🚨 force-refresh-movies-data 🚨"}
        </button>
        {cacheStatus.lastUpdated && (
          <p className="text-xs text-muted-foreground/50">
            Last updated: {new Date(cacheStatus.lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

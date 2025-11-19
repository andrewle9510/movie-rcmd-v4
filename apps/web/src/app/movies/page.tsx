"use client";

import { useState, useEffect } from "react";
import { MovieCard, type GridSize } from "@/components/movie-card";
import { GridControls } from "@/components/grid-controls";
import { PaginationControls } from "@/components/pagination-controls";
import { useMovies } from "@/hooks/use-movies";
import { Input, Button, Badge } from "@/components/ui-simple";

const ITEMS_PER_PAGE = 12;

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gridSize, setGridSize] = useState<GridSize>("medium");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const { movies, isLoading, error } = useMovies({
    searchQuery,
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

  const getGridClassName = () => {
    if (viewMode === "list") {
      return "grid grid-cols-1 gap-4";
    }
    
    switch (gridSize) {
      case "small":
        return "grid gap-4 grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]";
      case "large":
        return "grid gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]";
      default:
        return "grid gap-6 grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]";
    }
  };

  const getContainerStyles = () => ({
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1rem"
  });

  const getHeaderStyles = () => ({
    marginBottom: "2rem"
  });

  const getControlsStyles = () => ({
    marginBottom: "1.5rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem"
  });

  const getSearchBarStyles = () => ({
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "1rem",
    justifyContent: "space-between"
  });

  const getGenreFilterStyles = () => ({
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem"
  });

  const getLoadingStyles = () => ({
    display: "flex",
    justifyContent: "center",
    padding: "3rem 0"
  });

  const getEmptyStateStyles = () => ({
    textAlign: "center" as const,
    padding: "4rem 1rem"
  });

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination
  const filteredMovies = movies || [];
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (error) {
    return (
      <div style={getContainerStyles()}>
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "0.5rem",
          padding: "1rem",
          color: "#dc2626"
        }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
            Error loading movies
          </h2>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            There was a problem fetching the movie data.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={getContainerStyles()}>
      <div style={getHeaderStyles()}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Browse Movies
        </h1>
        <p style={{ color: "#6b7280" }}>
          Discover and explore our collection of movies
        </p>
      </div>

      <div style={getControlsStyles()}>
        <div style={getSearchBarStyles()}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        <div style={getLoadingStyles()}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "3rem",
              height: "3rem",
              border: "4px solid #e5e7eb",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem"
            }}></div>
            <p style={{ fontSize: "1.125rem", color: "#374151", marginBottom: "0.5rem" }}>
              Loading movies...
            </p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Please wait while we fetch the latest movies
            </p>
          </div>
        </div>
      ) : paginatedMovies.length > 0 ? (
        <>
          <div className={getGridClassName()}>
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
        <div style={getEmptyStateStyles()}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎬</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              No movies found
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              {searchQuery
                ? "Try adjusting your search criteria to find what you're looking for."
                : "No movies are available in the database at the moment."}
            </p>
          </div>
          {!searchQuery && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <Button onClick={handleSeeding} size="lg" style={{ padding: "0.75rem 2rem" }}>
                Load Sample Movies
              </Button>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                This will add some example movies to browse
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

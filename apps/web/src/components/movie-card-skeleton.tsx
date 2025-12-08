export type GridSize = "small" | "medium" | "large";

interface MovieCardSkeletonProps {
  gridSize?: GridSize;
  viewMode?: "grid" | "list";
}

export function MovieCardSkeleton({ 
  gridSize = "medium", 
  viewMode = "grid" 
}: MovieCardSkeletonProps) {
  const getCardStyles = () => {
    const baseStyles = {
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem", 
      overflow: "hidden"
    } as React.CSSProperties;
    
    if (viewMode === "list") {
      return {
        ...baseStyles,
        display: "flex",
        flexDirection: "row" as const,
        marginBottom: "1rem"
      };
    }
    
    return {
      ...baseStyles,
      margin: "1rem"
    };
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
      paddingTop: "150%", // 2/3 aspect ratio
      overflow: "hidden"
    };
  };

  const getPlaceholderStyles = (height: number, width: string) => ({
    height: `${height}rem`,
    width: width,
    backgroundColor: "#f3f4f6",
    borderRadius: "0.25rem",
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
  });

  return (
    <div style={getCardStyles()}>
      <div style={viewMode === "list" ? getImageContainerStyles() : {}}>
        <div style={getImageContainerStyles()}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#f3f4f6",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          }}></div>
        </div>
      </div>
      
      <div style={{ 
        padding: gridSize === "small" ? "0.5rem" : gridSize === "large" ? "1.5rem" : "1rem" 
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Title */}
          <div style={getPlaceholderStyles(
            viewMode === "list" ? 1.5 : gridSize === "small" ? 1 : gridSize === "large" ? 2 : 1.5,
            viewMode === "list" ? "75%" : "100%"
          )}></div>
          
          {/* Description for larger views */}
          {(gridSize !== "small" || viewMode === "list") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={getPlaceholderStyles(
                viewMode === "list" || gridSize === "large" ? 1 : 0.75,
                viewMode === "list" ? "90%" : "85%"
              )}></div>
              <div style={getPlaceholderStyles(
                viewMode === "list" || gridSize === "large" ? 1 : 0.75,
                viewMode === "list" ? "80%" : "70%"
              )}></div>
              {(viewMode === "list" || gridSize === "large") && (
                <div style={getPlaceholderStyles(1, "65%")}></div>
              )}
            </div>
          )}
          
          {/* Genre badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                style={getPlaceholderStyles(
                  1.25,
                  gridSize === "small" ? "4rem" : "5rem"
                )}
              ></div>
            ))}
          </div>
          
          {/* Rating and year */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={getPlaceholderStyles(1, "3rem")}></div>
            <div style={getPlaceholderStyles(1, "2.5rem")}></div>
          </div>
          
          {/* Duration */}
          <div style={getPlaceholderStyles(0.75, "4rem")}></div>
          
          {/* Watchlist button for large/list views */}
          {(gridSize === "large" || viewMode === "list") && (
            <div style={getPlaceholderStyles(2.25, "100%")}></div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

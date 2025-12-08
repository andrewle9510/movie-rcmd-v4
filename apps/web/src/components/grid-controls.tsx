type GridSize = "small" | "medium" | "large";
type ViewMode = "grid" | "list";

interface GridControlsProps {
  gridSize: GridSize;
  viewMode: ViewMode;
  onGridSizeChange: (size: GridSize) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function GridControls({
  gridSize,
  viewMode,
  onGridSizeChange,
  onViewModeChange,
}: GridControlsProps) {
  const buttonClass = (active: boolean) => `
    w-8 h-8 flex items-center justify-center rounded-md transition-colors
    ${active 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent/20"
    }
  `;

  return (
    <div className="flex items-center gap-3 bg-card p-1 rounded-lg border border-border/50">
      {/* Grid size controls */}
      <div className="flex items-center gap-1 border-r border-border/50 pr-3 mr-1">
        <button
          onClick={() => onGridSizeChange("small")}
          className={buttonClass(gridSize === "small")}
          title="Compact grid"
          aria-label="Compact grid"
        >
          <span className="text-xs">S</span>
        </button>
        <button
          onClick={() => onGridSizeChange("medium")}
          className={buttonClass(gridSize === "medium")}
          title="Medium grid"
          aria-label="Medium grid"
        >
          <span className="text-xs">M</span>
        </button>
        <button
          onClick={() => onGridSizeChange("large")}
          className={buttonClass(gridSize === "large")}
          title="Large grid"
          aria-label="Large grid"
        >
          <span className="text-xs">L</span>
        </button>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onViewModeChange("grid")}
          className={buttonClass(viewMode === "grid")}
          title="Grid view"
          aria-label="Grid view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={buttonClass(viewMode === "list")}
          title="List view"
          aria-label="List view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

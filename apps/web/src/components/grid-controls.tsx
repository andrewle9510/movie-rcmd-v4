import { Button } from "./ui-simple";

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
  const getIconButtonStyles = (active: boolean) => ({
    border: "1px solid #d1d5db",
    backgroundColor: active ? "#f3f4f6" : "#ffffff",
    borderRadius: "0.375rem",
    padding: "0",
    width: "2rem",
    height: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "0.25rem",
    cursor: "pointer",
    transition: "background-color 0.15s ease-in-out"
  });

  const getContainerStyles = () => ({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  });

  return (
    <div style={getContainerStyles()}>
      {/* Grid size controls */}
      <div style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #d1d5db",
        borderRadius: "0.375rem",
        padding: "0.125rem"
      }}>
        <div
          onClick={() => onGridSizeChange("small")}
          style={getIconButtonStyles(gridSize === "small")}
          title="Compact grid"
        >
          ▢
        </div>
        <div
          onClick={() => onGridSizeChange("medium")}
          style={getIconButtonStyles(gridSize === "medium")}
          title="Medium grid"
        >
          ⊞
        </div>
        <div
          onClick={() => onGridSizeChange("large")}
          style={getIconButtonStyles(gridSize === "large")}
          title="Large grid"
        >
          ⊡
        </div>
      </div>

      {/* View mode toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #d1d5db",
        borderRadius: "0.375rem",
        padding: "0.125rem"
      }}>
        <div
          onClick={() => onViewModeChange("grid")}
          style={getIconButtonStyles(viewMode === "grid")}
          title="Grid view"
        >
          ⊞
        </div>
        <div
          onClick={() => onViewModeChange("list")}
          style={getIconButtonStyles(viewMode === "list")}
          title="List view"
        >
          ≡
        </div>
      </div>
    </div>
  );
}

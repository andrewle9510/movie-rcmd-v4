"use client";

import { Button } from "@/components/ui/button";
import { Square, LayoutGrid, List } from "lucide-react";

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
  return (
    <div className="flex items-center gap-2">
      {/* View mode toggle */}
      <div className="flex items-center border rounded-md p-1">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
          className="h-8 w-8 p-0"
          title="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          className="h-8 w-8 p-0"
          title="List view"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { RefreshCw } from "lucide-react";

interface MovieRefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: string;
}

export function MovieRefreshButton({ onRefresh, isLoading, lastUpdated }: MovieRefreshButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-gray-50">
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {isLoading ? 'Updating...' : 'Force Update Movies'}
      </button>
      {lastUpdated && (
        <p className="text-sm text-gray-600">
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
}

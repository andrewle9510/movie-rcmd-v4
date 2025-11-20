interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 20,
}: PaginationControlsProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const buttonClass = (active?: boolean, disabled?: boolean) => `
    min-w-9 h-9 px-2 flex items-center justify-center rounded-md text-sm font-medium transition-colors
    ${disabled 
      ? "opacity-50 cursor-not-allowed text-muted-foreground" 
      : active 
        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
        : "bg-card text-foreground border border-border/50 hover:bg-accent/10 hover:text-accent-foreground"
    }
  `;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {totalItems > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startItem}</span> to <span className="font-medium text-foreground">{endItem}</span> of <span className="font-medium text-foreground">{totalItems}</span> results
        </p>
      )}
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`${buttonClass(false, currentPage <= 1)} px-3`}
        >
          ‹ Previous
        </button>
        
        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={typeof page !== "number"}
              className={buttonClass(typeof page === "number" && page === currentPage, typeof page !== "number")}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`${buttonClass(false, currentPage >= totalPages)} px-3`}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

export const UIConfig = {
  layout: {
    containerMaxWidth: "1200px",
    pagePadding: "2rem 1rem",
  },
  grid: {
    gap: {
      small: "1rem",
      medium: "1.5rem",
      large: "1.5rem",
    },
    minColumnWidth: {
      small: "140px",
      medium: "180px",
      large: "280px",
    },
  },
  card: {
    aspectRatio: "150%", // 2:3 ratio
    showInfo: false,
    showDescription: false,
    showRating: false,
    showDuration: false,
    showWatchlistButton: false,
    padding: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
    },
    infoSpacing: "0.5rem", // Spacing between elements inside card info
  },
} as const;

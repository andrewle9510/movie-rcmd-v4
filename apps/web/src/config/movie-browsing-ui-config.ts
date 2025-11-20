// Centralized UI configuration for the movie browsing experience
// This config controls the layout, grid, and movie card appearance
// making it easy to adjust the visual design without modifying components

export const UIConfig = {
  // Layout configuration for the main movie browsing page
  layout: {
    containerMaxWidth: "1200px", // Maximum width of the main content container
    pagePadding: "2rem 1rem", // Vertical (2rem) and horizontal (1rem) padding for the page
  },

  // Grid configuration for movie card layout
  grid: {
    gap: {
      small: "1rem", // Spacing between cards on small screens
      medium: "1.5rem", // Spacing between cards on medium screens
      large: "1.5rem", // Spacing between cards on large screens
    },
    minColumnWidth: {
      small: "140px", // Minimum width for each card column on small screens
      medium: "180px", // Minimum width for each card column on medium screens
      large: "280px", // Minimum width for each card column on large screens
    },
  },

  // Movie card configuration - controls individual card appearance and content
  card: {
    aspectRatio: "150%", // 2:3 ratio for movie posters (width:height)

    // Boolean flags to control which card elements are displayed
    showInfo: false, // Hide movie title and basic info
    showDescription: false, // Hide movie description text
    showRating: false, // Hide movie rating stars
    showDuration: false, // Hide movie duration
    showWatchlistButton: false, // Hide add to watchlist button

    padding: {
      small: "0.5rem", // Padding inside card on small screens
      medium: "1rem", // Padding inside card on medium screens
      large: "1.5rem", // Padding inside card on large screens
    },
    infoSpacing: "0.5rem", // Spacing between elements inside card info section
  },
} as const;

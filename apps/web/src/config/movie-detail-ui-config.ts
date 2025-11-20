// Centralized UI configuration for the movie detail page
// This config controls the layout, backdrop, and poster positioning
// making it easy to adjust the visual design without modifying component logic

export const MovieDetailUIConfig = {
  // Layout configuration for the movie detail page structure
  layout: {
    backdropHeight: "500px", // Height of the hero backdrop image section
    contentNegativeMargin: "-8rem", // Negative margin to pull content up under backdrop (matches -mt-32, -8rem = -128px)
    gap: "2.5rem", // Spacing between content sections (matches gap-10, 2.5rem = 40px)
  },

  // Poster configuration for movie poster display
  poster: {
    width: "250px", // Fixed width of the movie poster image
    position: "right", // Controls poster position: 'left' places poster on left side, 'right' on right side
    aspectRatio: "2/3", // Standard movie poster aspect ratio (width:height)
  },
} as const;

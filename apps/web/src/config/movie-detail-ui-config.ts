// Centralized UI configuration for the movie detail page
// This config controls the layout, backdrop, and poster positioning
// making it easy to adjust the visual design without modifying component logic

export const MovieDetailUIConfig = {
  // Layout configuration for the movie detail page structure
  layout: {
    backdropHeight: "500px", // Height of the hero backdrop image section
    contentNegativeMargin: "-2rem", // Negative margin to pull content up under backdrop (matches -mt-32, -8rem = -128px)
    gap: "2.5rem", // Spacing between content sections (matches gap-10, 2.5rem = 40px)
  },

  // Backdrop configuration
  backdrop: {
    opacity: "1", // Opacity of the backdrop image (0 to 1). Set to "1" for full brightness.
    loadingOpacity: 0.5, // Opacity while image is loading (0 to 1). Reduces grey background visibility during fade-in.
    backdropLoadTransitionDuration: "0.5s", // Duration of the fade-in animation when backdrop loads. Format: any CSS duration (e.g., "0.3s", "0.5s", "400ms")
    screenshotTransitionDuration: "0.2s", // Duration of fade transition when switching screenshots. Format: any CSS duration (e.g., "0.3s", "0.5s", "400ms")
    bottomFade: {
      enabled: true, // Turn on/off the bottom gradient fade
      height: "40%", // How much of the backdrop height is covered (e.g., "50%", "200px", "100%")
      intensity: "soft", // "soft" (light fade), "medium" (standard), "hard" (strong fade)
    },
  },

  // Poster configuration for movie poster display
  poster: {
    width: "250px", // Fixed width of the movie poster image
    position: "left", // Controls poster position: 'left' places poster on left side, 'right' on right side
    aspectRatio: "2/3", // Standard movie poster aspect ratio (width:height)
  },

  // Carousel controls for screenshot navigation
  carouselControls: {
    size: "20px", // Icon size for navigation buttons (ChevronLeft/ChevronRight). Format: any CSS size value
    padding: "8px", // Internal padding of the button. Format: any CSS padding value
    backgroundColor: "bg-black/40", // Background color when idle. Format: "bg-{color}/{opacity}" (e.g., "bg-black/40", "bg-white/30", "bg-blue/50")
    hoverBackgroundColor: "bg-white/40", // Background color on hover. Format: "bg-{color}/{opacity}" (e.g., "bg-white/40", "bg-yellow/60")
    iconColor: "text-white", // Color of the chevron icons. Format: "text-{color}" (e.g., "text-white", "text-gray-300")
    position: {
      bottom: "40px", // Distance from bottom of backdrop. Format: any CSS size value (e.g., "16px", "2rem", "20px")
      sides: "16px", // Distance from left/right edges of backdrop. Format: any CSS size value (e.g., "16px", "1rem", "20px")
    },
  },

  // Header typography configuration
  headers: {
    title: {
      fontFamily: "Montserrat", // Font family for movie title
      fontSize: "2rem", // Size for movie title
      fontWeight: "700", // Font weight for movie title (bold)
      color: "text-white", // Text color for movie title
      lineHeight: "1.2", // Line height for movie title
      letterSpacing: "-0.02em", // Letter spacing for movie title
    },
    releaseYear: {
      fontFamily: "Inter", // Font family for release year
      fontSize: "1.25rem", // Size for release year
      fontWeight: "400", // Font weight for release year (normal)
      color: "text-gray-300", // Text color for release year
      lineHeight: "1.4", // Line height for release year
      letterSpacing: "", // Letter spacing for release year
    },
    duration: {
      fontFamily: "Inter", // Font family for movie duration
      fontSize: "1.25rem", // Size for movie duration
      fontWeight: "400", // Font weight for movie duration (medium)
      color: "text-gray-400", // Text color for movie duration
      lineHeight: "1.4", // Line height for movie duration
      letterSpacing: "", // Letter spacing for movie duration
    },
  },
} as const;

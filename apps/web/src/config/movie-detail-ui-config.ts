// Centralized UI configuration for the movie detail page
// This config controls the layout, backdrop, and poster positioning
// making it easy to adjust the visual design without modifying component logic

export enum PosterPosition {
  LEFT = "left",
  RIGHT = "right",
}

export enum FontFamily {
  // Styles
  Headline = "var(--font-montserrat), sans-serif",
  Body     = "var(--font-inter), sans-serif",
  Classic  = "var(--font-playfair), serif",
  Modern   = "var(--font-lato), sans-serif",
}

export enum FontSize {
  Large  = "2.25rem",      // For main titles
  Medium = "1.5rem",    // For taglines/subtitles
  Small  = "1rem",  // For body text
}

export enum FontWeight {
  Bold   = "700",
  Medium = "500",
  Regular = "300",
}

export enum FontStyle {
  Normal = "normal",
  Italic = "italic",
}

export enum TextColor {
  White   = "text-white",
  Light   = "text-gray-200",
  Muted   = "text-gray-400",
  Accent  = "text-blue-400",
}

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
    position: PosterPosition.LEFT, // Controls poster position: 'left' places poster on left side, 'right' on right side
    aspectRatio: "2/3", // Standard movie poster aspect ratio (width:height)
    sticky: {
      enabled: true, // Keeps poster visible while scrolling on md+ screens
      topOffset: "1.5rem", // Sticky offset from top of viewport. Format: any CSS size value (e.g., "24px", "1.5rem")
    },
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
      fontFamily: FontFamily.Headline, // Font family for movie title
      fontSize: FontSize.Large, // Size for movie title
      fontWeight: FontWeight.Bold, // Font weight for movie title (bold)
      color: TextColor.White, // Text color for movie title
      lineHeight: "1.1", // Line height for movie title
      letterSpacing: "-0.02em", // Letter spacing for movie title
    },
    releaseYear: {
      fontFamily: FontFamily.Headline, // Font family for release year
      fontSize: FontSize.Medium, // Size for release year (custom size, slightly larger than Small)
      fontWeight: FontWeight.Regular, // Font weight for release year (normal)
      color: "text-gray-300", // Text color for release year
      lineHeight: "1.4", // Line height for release year
      letterSpacing: "0.02em", // Letter spacing for release year
    },
    duration: {
      fontFamily: FontFamily.Headline, // Font family for movie duration
      fontSize: FontSize.Small, // Size for movie duration (custom size)
      fontWeight: FontWeight.Regular, // Font weight for movie duration (medium)
      color: TextColor.Muted, // Text color for movie duration
      lineHeight: "1.4", // Line height for movie duration
      letterSpacing: "0.02em", // Letter spacing for movie duration
    },
  },

  // Tagline configuration
  tagline: {
    fontFamily: FontFamily.Headline, // Matches title font
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Regular,
    color: TextColor.Light,
    lineHeight: "1.4",
    fontStyle: FontStyle.Italic,
    marginBottom: "2rem",
  },

  // Description configuration
  description: {
    fontFamily: FontFamily.Modern, // Clean sans-serif for reading
    fontSize: FontSize.Small, // 18px
    fontWeight: FontWeight.Regular,
    color: "text-gray-100",
    lineHeight: "1.8", // Loose leading for readability
    maxWidth: "65ch", // Optimal reading width
  },

  // Temporary debug helpers for layout testing
  debug: {
    mockLongContent: {
      enabled: false, // Adds extra text-only sections so the page can scroll (useful for testing sticky poster)
      paragraphs: 18,
    },
  },
};

export const MovieDetailUIConfig = {
  layout: {
    backdropHeight: "500px",
    contentNegativeMargin: "-8rem", // Matches -mt-32 (-8rem = -128px)
    gap: "2.5rem", // Matches gap-10 (2.5rem = 40px)
  },
  poster: {
    width: "250px",
    position: "right", // Controls flex-direction: 'left' | 'right'
    aspectRatio: "2/3",
  },
} as const;

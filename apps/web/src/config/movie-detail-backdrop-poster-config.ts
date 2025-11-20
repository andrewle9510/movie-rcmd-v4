// Map TMDB ID to specific index in the saved poster/backdrop lists
// When configured, these will override the default main_poster/main_backdrop
// Indices correspond to the top 10 highest voted images stored in the database (0-9)

export const MovieDetailImageConfig: Record<number, { posterIndex?: number; backdropIndex?: number }> = {
  // Example:
  // 550: { posterIndex: 1, backdropIndex: 0 } // Fight Club
  // 157336: { posterIndex: 0, backdropIndex: 2 } // Interstellar
};

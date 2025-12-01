// Map TMDB ID to specific index in the saved poster/backdrop lists
// When configured, these will override the default main_poster/main_backdrop
// Indices correspond to the top 10 highest voted images stored in the database (0-9)

export const MovieDetailImageConfig: Record<
  number,
  {
    posterFilepath?: string;
    backdropFilepath?: string;
  }
> = {
  // Example:
  // 550: { posterIndex: 1, backdropIndex: 0 } // Fight Club
  // 157336: { posterIndex: 0, backdropIndex: 2 } // Interstellar
  1022789: {
    backdropFilepath: "/7U8EvrqZDPxafnucxWAttMaFYbc.jpg",
  },
  335984: { //blade runner 2049
    posterFilepath: "/xTwqmwpIefT6wWDgCQXdP8lpbI9.jpg",
    //backdropFilepath: "/1DPPsKEOMqzqECuhezJuvzEnk9S.jpg",
  },
};

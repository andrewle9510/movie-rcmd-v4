"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getDbFetchTime } from "@/features/movie-browsing/utils/movie-cache";

export function Footer() {
  const [moviesDataVersion, setMoviesDataVersion] = useState<string>("");
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [fetchTime, setFetchTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const versionData = useQuery(api.movies.getMoviesDataVersion);

  useEffect(() => {
    if (versionData) {
      setMoviesDataVersion(versionData.moviesDataVersion);
      setTotalMovies(versionData.totalMovies);
      const lastDbFetch = getDbFetchTime();
      setFetchTime(lastDbFetch || "Not fetched yet");
      setLoading(false);
    }
  }, [versionData]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "N/A";
    }
  };

  return (
    <footer style={{
      backgroundColor: "#f9fafb",
      borderTop: "1px solid #e5e7eb",
      marginTop: "4rem",
      padding: "2rem 1rem",
      textAlign: "center",
      fontSize: "0.75rem",
      color: "#6b7280"
    }}>
      {loading ? (
        <p>Loading data info...</p>
      ) : (
        <>
          <p>Movies in Database: <strong>{totalMovies}</strong></p>
          <p>Latest Movies Data Update: <strong>{formatDate(moviesDataVersion)}</strong></p>
          <p>Latest Fetch: <strong>{fetchTime}</strong></p>
        </>
      )}
    </footer>
  );
}

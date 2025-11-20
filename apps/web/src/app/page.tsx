import Link from "next/link";
import { Button } from "@/components/ui-simple";

export default function HomePage() {
  const getContainerStyles = () => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  });

  const getTextContainerStyles = () => ({
    textAlign: "center" as const,
    maxWidth: "42rem"
  });

  const getHeadingStyles = () => ({
    fontSize: "2.25rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    background: "linear-gradient(to right, #ffffff, #e0e7ff)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
  });

  const getDescriptionStyles = () => ({
    fontSize: "1.25rem",
    color: "#e0e7ff",
    marginBottom: "2rem",
    textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
  });

  const getLinkStyles = {
    textDecoration: "none",
    display: "inline-block"
  };

  return (
    <div style={getContainerStyles()}>
      <div style={getTextContainerStyles()}>
        <h1 style={getHeadingStyles()}>
          Movie Recommendation System
        </h1>
        <p style={getDescriptionStyles()}>
          Discover amazing movies and get personalized recommendations based on your preferences
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <Link href="/movies" style={getLinkStyles}>
            <Button size="lg">
              Browse Movies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

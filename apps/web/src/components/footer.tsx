export function Footer() {
  const getFooterStyles = () => ({
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
    marginTop: "4rem",
    padding: "2rem 1rem"
  });

  const getContainerStyles = () => ({
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem"
  });

  const getSectionTitleStyles = () => ({
    fontWeight: "600",
    marginBottom: "0.75rem",
    color: "#111827"
  });

  const getLinkStyles = () => ({
    color: "#6b7280",
    textDecoration: "none",
    fontSize: "0.875rem",
    display: "block",
    marginBottom: "0.5rem",
    transition: "color 0.15s ease-in-out"
  });

  const getBottomSectionStyles = () => ({
    marginTop: "2rem",
    paddingTop: "2rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "1rem"
  });

  return (
    <footer style={getFooterStyles()}>
      <div style={getContainerStyles()}>
        {/* Brand Section */}
        <div>
          <h3 style={getSectionTitleStyles()} className="flex items-center gap-2">
            🎬 MovieRcmd
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", maxWidth: "20rem" }}>
            Discover amazing movies and get personalized recommendations based on your preferences.
            Your perfect movie night is just a click away.
          </p>
        </div>
        
        {/* Quick Links */}
        <div>
          <h3 style={getSectionTitleStyles()}>Quick Links</h3>
          <div>
            <a href="/" style={getLinkStyles()}>
              Home
            </a>
            <a href="/movies" style={getLinkStyles()}>
              Browse Movies
            </a>
            <a href="/top-rated" style={getLinkStyles()}>
              Top Rated
            </a>
            <a href="/watchlist" style={getLinkStyles()}>
              Watchlist
            </a>
          </div>
        </div>
        
        {/* About */}
        <div>
          <h3 style={getSectionTitleStyles()}>About</h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            Made with ❤️ for movie lovers
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...getLinkStyles,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem"
            }}
          >
            📁 GitHub
          </a>
        </div>
      </div>
      
      <div style={getBottomSectionStyles()}>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} MovieRcmd. All rights reserved.
        </p>
        <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
          Powered by Next.js
        </p>
      </div>
    </footer>
  );
}

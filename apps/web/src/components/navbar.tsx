"use client";

import { useState } from "react";
import { Input, Button, Badge } from "@/components/ui-simple";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to movies page with search query
    if (searchQuery.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getNavbarStyles = () => ({
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "0 1rem",
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
  });

  const getContainerStyles = () => ({
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "4rem"
  });

  const getLogoStyles = () => ({
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#3b82f6",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  });

  const getNavLinksStyles = () => ({
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    listStyle: "none",
    margin: 0,
    padding: 0
  });

  const getLinkStyles = () => ({
    color: "#374151",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.15s ease-in-out",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem"
  });

  const getMobileMenuButtonStyles = () => ({
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    display: "none" as const
  });

  const getSearchFormStyles = () => ({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  });

  const getMobileMenuStyles = (open: boolean) => ({
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "1rem",
    display: open ? "block" : "none" as const,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  });

  return (
    <nav style={getNavbarStyles()}>
      <div style={getContainerStyles()}>
        <a href="/" style={getLogoStyles()}>
          🎬 MovieRcmd
        </a>

        {/* Desktop Navigation */}
        <ul style={getNavLinksStyles()}>
          <li>
            <a href="/" style={getLinkStyles()}>
              🏠 Home
            </a>
          </li>
          <li>
            <a href="/movies" style={getLinkStyles()}>
              🎬 Movies
            </a>
          </li>
          <li>
            <a href="/watchlist" style={getLinkStyles()}>
              ❤️ Watchlist
            </a>
          </li>
        </ul>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={getSearchFormStyles()}>
          <Input
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "200px" }}
          />
          <Button type="submit" size="sm">
            🔍
          </Button>
        </form>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            ...getMobileMenuButtonStyles,
            display: isMenuOpen || window.innerWidth < 768 ? "block" : "none"
          }}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      <div style={getMobileMenuStyles(isMenuOpen)}>
        <ul style={{ ...getNavLinksStyles(), flexDirection: "column" as const, gap: "0.5rem" }}>
          <li>
            <a href="/" style={getLinkStyles()} onClick={() => setIsMenuOpen(false)}>
              🏠 Home
            </a>
          </li>
          <li>
            <a href="/movies" style={getLinkStyles()} onClick={() => setIsMenuOpen(false)}>
              🎬 Movies
            </a>
          </li>
          <li>
            <a href="/watchlist" style={getLinkStyles()} onClick={() => setIsMenuOpen(false)}>
              ❤️ Watchlist
            </a>
          </li>
        </ul>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          nav button:last-child {
            display: none !important;
          }
          nav > div:last-child {
            display: flex !important;
          }
        }
        
        a:hover {
          color: #3b82f6 !important;
          background-color: #f3f4f6;
        }
      `}</style>
    </nav>
  );
}

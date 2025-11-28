"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="bg-background border-b border-border px-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16">
        <Link 
          href="/" 
          className="text-2xl font-bold text-primary flex items-center gap-2 no-underline hover:opacity-90"
        >
          🎬 MovieRcmd
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
          <li>
            <Link href="/" className="text-foreground font-medium px-3 py-2 rounded-md hover:text-primary hover:bg-secondary transition-colors no-underline">
              🏠 Home
            </Link>
          </li>
          <li>
            <Link href="/movies" className="text-foreground font-medium px-3 py-2 rounded-md hover:text-primary hover:bg-secondary transition-colors no-underline">
              🎬 Movies
            </Link>
          </li>

        </ul>

        <div className="flex items-center gap-2">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] px-3 py-1.5 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button 
              type="submit" 
              className="p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              🔍
            </button>
          </form>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border border-border rounded-md bg-background cursor-pointer hover:bg-secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 shadow-md md:hidden">
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            <li>
              <Link 
                href="/" 
                className="block text-foreground font-medium px-3 py-2 rounded-md hover:text-primary hover:bg-secondary transition-colors no-underline"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Home
              </Link>
            </li>
            <li>
              <Link 
                href="/movies" 
                className="block text-foreground font-medium px-3 py-2 rounded-md hover:text-primary hover:bg-secondary transition-colors no-underline"
                onClick={() => setIsMenuOpen(false)}
              >
                🎬 Movies
              </Link>
            </li>

          </ul>
          <form onSubmit={handleSearch} className="mt-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button 
              type="submit" 
              className="p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              🔍
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}

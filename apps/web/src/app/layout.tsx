import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Movie Recommendation System",
  description: "Discover and browse movies with personalized recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const getBodyStyles = {
    fontFamily: 'Inter, sans-serif',
    margin: 0,
    padding: 0,
    minHeight: "100vh"
  };

  const getMainContainerStyles = {
    minHeight: "100vh"
  };

  return (
    <html lang="en">
      <body style={getBodyStyles}>
        <ConvexClientProvider>
          <div style={getMainContainerStyles}>
            {children}
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

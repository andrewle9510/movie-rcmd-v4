import type { Metadata } from "next";
import { Inter, Montserrat, Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import { CacheInitializer } from "@/components/cache-initializer";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

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
    margin: 0,
    padding: 0,
    minHeight: "100vh"
  };

  const getMainContainerStyles = {
    minHeight: "100vh"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} ${playfair.variable} ${lato.variable} font-sans`} style={getBodyStyles}>
        <CacheInitializer />
        <ConvexClientProvider>
          <div style={getMainContainerStyles}>
            {children}
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

import { MoviesProvider } from "@/providers/MoviesProvider";
import { Footer } from "@/components/footer";

export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MoviesProvider>
      <div className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </MoviesProvider>
  );
}

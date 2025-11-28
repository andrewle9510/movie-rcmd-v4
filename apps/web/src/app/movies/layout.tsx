import { MoviesProvider } from "@/providers/MoviesProvider";

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
      </div>
    </MoviesProvider>
  );
}

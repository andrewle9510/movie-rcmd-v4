import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent drop-shadow-md">
          Movie Recommendation System
        </h1>
        <p className="text-xl text-indigo-100 mb-8 drop-shadow-sm">
          Discover amazing movies and get personalized recommendations based on your preferences
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/movies" className="inline-block">
            <button className="px-8 py-3 bg-primary text-primary-foreground text-lg font-medium rounded-md shadow-lg hover:bg-primary/90 transition-all">
              Browse Movies
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

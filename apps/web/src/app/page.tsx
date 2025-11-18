import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Movie Recommendation System</h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover amazing movies and get personalized recommendations based on your preferences
        </p>
        <div className="space-x-4">
          <Link href="/movies">
            <Button size="lg">Browse Movies</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

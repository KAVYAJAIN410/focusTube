"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";

interface Video {
  id: string;
  title: string;
  channel: string;
  channelIcon: string | null;
  publishedAt: string;
  thumbnail: string;
  views: string | null;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError("");
    setVideos([]);
    setNextPageToken(null);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setVideos(data.videos);
          setNextPageToken(data.nextPageToken);
        }
      })
      .catch(() => setError("Failed to fetch results"))
      .finally(() => setLoading(false));
  }, [query]);

  function loadMore() {
    if (!nextPageToken || loadingMore) return;

    setLoadingMore(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}&pageToken=${nextPageToken}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setVideos((prev) => {
            const existingIds = new Set(prev.map((v) => v.id));
            const unique = data.videos.filter((v: Video) => !existingIds.has(v.id));
            return [...prev, ...unique];
          });
          setNextPageToken(data.nextPageToken);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }

  return (
    <>
      <Header searchValue={query} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && videos.length === 0 && query && (
          <p className="py-20 text-center text-zinc-500">
            No results found for &ldquo;{query}&rdquo;
          </p>
        )}

        {!loading && videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>

            {nextPageToken && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-full border border-zinc-300 px-8 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                      Loading...
                    </span>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}

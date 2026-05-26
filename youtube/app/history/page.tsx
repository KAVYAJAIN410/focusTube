"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Link from "next/link";

interface HistoryEntry {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  watchedAt: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setHistory(data.history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
        <h1 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">Watch History</h1>

        {status === "unauthenticated" && (
          <p className="py-20 text-center text-zinc-500">
            Sign in to see your watch history.
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
          </div>
        )}

        {!loading && status === "authenticated" && history.length === 0 && (
          <p className="py-20 text-center text-zinc-500">
            No videos watched yet. Start searching and learning!
          </p>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {history.map((entry) => (
              <Link
                key={entry.id}
                href={`/watch?v=${entry.videoId}&t=${encodeURIComponent(entry.title)}&c=${encodeURIComponent(entry.channel)}&thumb=${encodeURIComponent(entry.thumbnail)}`}
                className="group flex flex-col gap-2 rounded-lg p-1.5 transition-colors hover:bg-zinc-50 sm:flex-row sm:gap-4 sm:p-2 dark:hover:bg-zinc-900"
              >
                <div className="w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:w-44 dark:bg-zinc-800">
                  {entry.thumbnail ? (
                    <img
                      src={entry.thumbnail}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-video w-full" />
                  )}
                </div>
                <div className="flex flex-col justify-center gap-0.5 px-1 sm:gap-1 sm:px-0">
                  <h3 className="line-clamp-2 text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {entry.channel}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    Watched {formatDate(entry.watchedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

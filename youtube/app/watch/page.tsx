"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense, useRef } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";

function WatchPlayer() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("v");
  const title = searchParams.get("t") || "";
  const channel = searchParams.get("c") || "";
  const thumbnail = searchParams.get("thumb") || "";
  const { data: session } = useSession();
  const loggedVideoId = useRef<string | null>(null);

  useEffect(() => {
    if (!videoId || !session?.user || loggedVideoId.current === videoId) return;
    loggedVideoId.current = videoId;

    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, title, channel, thumbnail }),
    }).catch(() => {})
  }, [videoId, session, title, channel, thumbnail]);

  if (!videoId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">No video specified.</p>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-2 py-4 sm:px-4 sm:py-8">
        <div className="overflow-hidden rounded-lg bg-black sm:rounded-xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="Video player"
            className="aspect-video w-full"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {title && (
          <div className="mt-3 px-1 sm:mt-4 sm:px-0">
            <h1 className="text-base font-semibold sm:text-xl">{decodeURIComponent(title)}</h1>
            {channel && (
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
                {decodeURIComponent(channel)}
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
        </div>
      }
    >
      <WatchPlayer />
    </Suspense>
  );
}

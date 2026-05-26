import { NextRequest, NextResponse } from "next/server";

function getApiKeys(): string[] {
  const keys = [
    process.env.YOUTUBE_API_KEY,
    process.env.YOUTUBE_API_KEY_2,
    process.env.YOUTUBE_API_KEY_3,
  ].filter((k): k is string => !!k && k !== "your_api_key_here");
  return keys;
}

let currentKeyIndex = 0;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const keys = getApiKeys();
  if (keys.length === 0) {
    return NextResponse.json(
      { error: "No YouTube API keys configured. Add YOUTUBE_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  const pageToken = request.nextUrl.searchParams.get("pageToken");

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIndex = (currentKeyIndex + attempt) % keys.length;
    const apiKey = keys[keyIndex];

    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "12",
      key: apiKey,
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
    );

    if (res.ok) {
      currentKeyIndex = keyIndex;
      const data = await res.json();

      const videos = data.items.map(
        (item: {
          id: { videoId: string };
          snippet: {
            title: string;
            channelTitle: string;
            publishedAt: string;
            thumbnails: { high?: { url: string }; medium?: { url: string } };
            description: string;
          };
        }) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          thumbnail:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            "",
          description: item.snippet.description,
        })
      );

      return NextResponse.json({ videos, nextPageToken: data.nextPageToken || null });
    }

    const errorData = await res.json();
    const isQuotaError =
      res.status === 403 &&
      errorData.error?.errors?.some(
        (e: { reason: string }) => e.reason === "quotaExceeded" || e.reason === "dailyLimitExceeded"
      );

    if (isQuotaError && attempt < keys.length - 1) {
      currentKeyIndex = (keyIndex + 1) % keys.length;
      continue;
    }

    return NextResponse.json(
      { error: errorData.error?.message || "YouTube API error" },
      { status: res.status }
    );
  }

  return NextResponse.json({ error: "All API keys exhausted" }, { status: 429 });
}

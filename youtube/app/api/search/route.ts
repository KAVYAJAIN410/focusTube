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

async function fetchWithKeyRotation(url: string, keys: string[]): Promise<Response | null> {
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIndex = (currentKeyIndex + attempt) % keys.length;
    const apiKey = keys[keyIndex];

    const res = await fetch(`${url}&key=${apiKey}`);

    if (res.ok) {
      currentKeyIndex = keyIndex;
      return res;
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

    return res;
  }
  return null;
}

function formatViewCount(count: string): string {
  const n = parseInt(count, 10);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return count;
}

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

  const searchParams = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "12",
  });

  if (pageToken) {
    searchParams.set("pageToken", pageToken);
  }

  const searchRes = await fetchWithKeyRotation(
    `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`,
    keys
  );

  if (!searchRes) {
    return NextResponse.json({ error: "All API keys exhausted" }, { status: 429 });
  }

  if (!searchRes.ok) {
    const errorData = await searchRes.json();
    return NextResponse.json(
      { error: errorData.error?.message || "YouTube API error" },
      { status: searchRes.status }
    );
  }

  const searchData = await searchRes.json();

  const videoIds = searchData.items
    .map((item: { id: { videoId: string } }) => item.id.videoId)
    .join(",");

  let viewCounts: Record<string, string> = {};
  let channelIcons: Record<string, string> = {};

  if (videoIds) {
    const statsParams = new URLSearchParams({
      part: "statistics",
      id: videoIds,
    });

    const channelIds = [
      ...new Set(
        searchData.items.map(
          (item: { snippet: { channelId: string } }) => item.snippet.channelId
        )
      ),
    ].join(",");

    const channelParams = new URLSearchParams({
      part: "snippet",
      id: channelIds,
    });

    const [statsRes, channelRes] = await Promise.all([
      fetchWithKeyRotation(
        `https://www.googleapis.com/youtube/v3/videos?${statsParams.toString()}`,
        keys
      ),
      fetchWithKeyRotation(
        `https://www.googleapis.com/youtube/v3/channels?${channelParams.toString()}`,
        keys
      ),
    ]);

    if (statsRes?.ok) {
      const statsData = await statsRes.json();
      for (const item of statsData.items) {
        viewCounts[item.id] = formatViewCount(item.statistics.viewCount || "0");
      }
    }

    if (channelRes?.ok) {
      const channelData = await channelRes.json();
      for (const item of channelData.items) {
        channelIcons[item.id] =
          item.snippet.thumbnails?.default?.url || "";
      }
    }
  }

  const videos = searchData.items.map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        channelId: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: { high?: { url: string }; medium?: { url: string } };
        description: string;
      };
    }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      channelIcon: channelIcons[item.snippet.channelId] || null,
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        "",
      description: item.snippet.description,
      views: viewCounts[item.id.videoId] || null,
    })
  );

  return NextResponse.json({ videos, nextPageToken: searchData.nextPageToken || null });
}

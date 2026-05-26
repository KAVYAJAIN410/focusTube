import Link from "next/link";

interface VideoCardProps {
  id: string;
  title: string;
  channel: string;
  publishedAt: string;
  thumbnail: string;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function decodeEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
  };
  return text.replace(/&(?:#x?[0-9a-fA-F]+|[a-z]+);/g, (match) => entities[match] || match);
}

export default function VideoCard({
  id,
  title,
  channel,
  publishedAt,
  thumbnail,
}: VideoCardProps) {
  return (
    <Link
      href={`/watch?v=${id}&t=${encodeURIComponent(title)}&c=${encodeURIComponent(channel)}&thumb=${encodeURIComponent(thumbnail)}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <img
          src={thumbnail}
          alt={title}
          className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {decodeEntities(title)}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{channel}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {timeAgo(publishedAt)}
        </p>
      </div>
    </Link>
  );
}

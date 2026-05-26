"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  defaultValue = "",
  autoFocus = false,
  size = "normal",
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  size?: "normal" | "large";
}) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  const inputClass =
    size === "large"
      ? "w-full rounded-full border border-zinc-300 bg-white px-4 py-3 text-base sm:px-6 sm:py-4 sm:text-lg text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
      : "w-full rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-900";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl min-w-0">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a topic..."
          autoFocus={autoFocus}
          className={inputClass}
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700 sm:right-2 sm:p-2 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={size === "large" ? "h-5 w-5 sm:h-6 sm:w-6" : "h-4 w-4 sm:h-5 sm:w-5"}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

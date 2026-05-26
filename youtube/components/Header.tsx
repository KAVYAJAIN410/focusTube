"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import SearchBar from "./SearchBar";
import Link from "next/link";

export default function Header({ searchValue }: { searchValue?: string }) {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center gap-2 sm:gap-4">
        <a href="/" className="shrink-0 text-lg font-bold tracking-tight sm:text-xl">
          <span className="text-blue-600 dark:text-blue-400">F</span>
          <span className="hidden sm:inline">
            <span className="text-blue-600 dark:text-blue-400">ocus</span>Tube
          </span>
          <span className="sm:hidden">T</span>
        </a>

        <SearchBar defaultValue={searchValue} />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          ) : session?.user ? (
            <>
              <Link
                href="/history"
                className="rounded-full p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 sm:p-0 sm:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:dark:hover:bg-transparent"
                title="History"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden text-sm sm:inline">History</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 sm:p-0 sm:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:dark:hover:bg-transparent"
                title="Sign out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden text-sm sm:inline">Sign out</span>
              </button>
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-7 w-7 rounded-full sm:h-8 sm:w-8"
                />
              )}
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 sm:px-4 sm:text-sm dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

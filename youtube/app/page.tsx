import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex w-full flex-col items-center gap-4 sm:gap-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          <span className="text-blue-600 dark:text-blue-400">Focus</span>Tube
        </h1>
        <p className="text-base text-zinc-500 sm:text-lg dark:text-zinc-400">
          Search. Learn. Nothing else.
        </p>
        <div className="mt-2 w-full max-w-xl sm:mt-4">
          <SearchBar autoFocus size="large" />
        </div>
      </div>
    </main>
  );
}

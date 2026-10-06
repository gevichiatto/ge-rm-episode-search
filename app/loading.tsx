import { messages } from "@/lib/messages";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10 sm:py-16">
      <p role="status" className="sr-only">
        {messages.loading}
      </p>
      <div aria-hidden="true" className="flex animate-pulse flex-col gap-3">
        <div className="h-9 w-2/3 rounded bg-zinc-300 dark:bg-zinc-700" />
        <div className="h-10 w-full rounded bg-zinc-300 dark:bg-zinc-700" />
        <div className="h-5 w-1/2 rounded bg-zinc-300 dark:bg-zinc-700" />
        <div className="h-5 w-1/3 rounded bg-zinc-300 dark:bg-zinc-700" />
        <div className="h-5 w-2/5 rounded bg-zinc-300 dark:bg-zinc-700" />
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";

import { messages } from "@/lib/messages";

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error.digest ?? error.message);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-4 py-16">
      <p role="alert">{messages.unexpectedError}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-md bg-foreground px-4 py-2 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {messages.retry}
      </button>
    </main>
  );
}

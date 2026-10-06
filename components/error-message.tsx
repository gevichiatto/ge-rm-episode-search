import Link from "next/link";

import { messages, RETRIABLE_CODES } from "@/lib/messages";
import type { EpisodeSearchErrorCode } from "@/lib/rickandmorty/errors";

interface ErrorMessageProps {
  code: EpisodeSearchErrorCode;
  /** Entrada original do usuário, reaproveitada no link de nova tentativa. */
  query?: string;
}

export function ErrorMessage({ code, query }: ErrorMessageProps) {
  const canRetry = RETRIABLE_CODES.includes(code) && query !== undefined;
  const retryHref = `/?${new URLSearchParams({ q: query ?? "" }).toString()}`;

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-red-600 p-4 text-red-700 dark:text-red-400"
    >
      <p>{messages.errors[code]}</p>
      {canRetry && (
        <Link href={retryHref} className="w-fit font-medium underline">
          {messages.retry}
        </Link>
      )}
    </div>
  );
}

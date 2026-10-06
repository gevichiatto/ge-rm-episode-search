import Link from "next/link";

import { messages } from "@/lib/messages";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">{messages.notFoundTitle}</h1>
      <Link href="/" className="font-medium text-accent underline">
        {messages.notFoundBack}
      </Link>
    </main>
  );
}

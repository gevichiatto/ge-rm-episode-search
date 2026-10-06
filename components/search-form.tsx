import { messages } from "@/lib/messages";

interface SearchFormProps {
  defaultValue?: string;
}

export function SearchForm({ defaultValue }: SearchFormProps) {
  return (
    <form method="GET" action="/" role="search" className="flex w-full flex-col gap-2 sm:flex-row">
      <label htmlFor="q" className="sr-only">
        {messages.searchLabel}
      </label>
      <input
        id="q"
        name="q"
        type="text"
        inputMode="text"
        autoComplete="off"
        required
        placeholder={messages.searchPlaceholder}
        defaultValue={defaultValue}
        className="flex-1 rounded-md border border-zinc-400 bg-transparent px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      />
      <button
        type="submit"
        className="rounded-md bg-foreground px-4 py-2 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {messages.searchButton}
      </button>
    </form>
  );
}

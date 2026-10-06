import { CharacterList } from "@/components/character-list";
import { PortalLogo } from "@/components/portal-logo";
import { ErrorMessage } from "@/components/error-message";
import { SearchForm } from "@/components/search-form";
import { messages } from "@/lib/messages";
import { EpisodeSearchError } from "@/lib/rickandmorty/errors";
import { getCharactersByEpisode } from "@/lib/rickandmorty/service";
import type { EpisodeCharacters } from "@/lib/rickandmorty/service";

type SearchOutcome =
  { ok: true; data: EpisodeCharacters } | { ok: false; error: EpisodeSearchError };

async function search(query: string): Promise<SearchOutcome> {
  try {
    return { ok: true, data: await getCharactersByEpisode(query) };
  } catch (error) {
    if (error instanceof EpisodeSearchError) return { ok: false, error };
    throw error; // inesperado: tratado por app/error.tsx
  }
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  const outcome = query ? await search(query) : undefined;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <PortalLogo className="size-16" />
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{messages.title}</h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">{messages.subtitle}</p>
      </header>
      <SearchForm defaultValue={query} />
      {outcome?.ok === false && <ErrorMessage code={outcome.error.code} query={query} />}
      {outcome?.ok === true && (
        <section
          aria-labelledby="results-title"
          className="flex flex-col gap-3 rounded-xl border border-zinc-300 bg-card p-5 dark:border-zinc-800"
        >
          <h2 id="results-title" className="text-xl font-medium">
            {outcome.data.episode.episode} - {outcome.data.episode.name}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {messages.resultsCount(outcome.data.characters.length)}
          </p>
          <CharacterList characters={outcome.data.characters} />
        </section>
      )}
    </main>
  );
}

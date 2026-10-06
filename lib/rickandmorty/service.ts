import { getCharactersByIds, getEpisodeByCode, getEpisodeById } from "@/lib/rickandmorty/client";
import { EpisodeNotFoundError } from "@/lib/rickandmorty/errors";
import { parseEpisodeInput } from "@/lib/rickandmorty/input";
import type { Episode } from "@/lib/rickandmorty/schemas";
import { disambiguateNames, extractCharacterIds, sortByName } from "@/lib/utils/character";

export interface CharacterSummary {
  name: string;
  image: string;
}

export interface EpisodeCharacters {
  episode: Episode;
  characters: CharacterSummary[];
}

async function findEpisode(input: string): Promise<Episode> {
  const parsed = parseEpisodeInput(input);

  if (parsed.type === "id") {
    return getEpisodeById(parsed.id);
  }

  const episode = await getEpisodeByCode(parsed.code);
  if (!episode) {
    throw new EpisodeNotFoundError(`Episode with code ${parsed.code} not found`);
  }
  return episode;
}

/**
 * Busca os personagens (nome e imagem) de um episódio (por id ou código S01E01),
 * em ordem alfabética.
 */
export async function getCharactersByEpisode(input: string): Promise<EpisodeCharacters> {
  const episode = await findEpisode(input);
  const ids = extractCharacterIds(episode.characters);

  // Nunca chamar /character/ sem ids: a API listaria todos os personagens.
  if (ids.length === 0) {
    return { episode, characters: [] };
  }

  const characters = await getCharactersByIds(ids);
  const names = disambiguateNames(characters);
  const summaries = characters.map((character, index) => ({
    name: names[index] ?? character.name,
    image: character.image,
  }));
  return { episode, characters: sortByName(summaries) };
}

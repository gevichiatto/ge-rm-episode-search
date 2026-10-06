import { getCharactersByIds, getEpisodeByCode, getEpisodeById } from "@/lib/rickandmorty/client";
import { EpisodeNotFoundError } from "@/lib/rickandmorty/errors";
import { parseEpisodeInput } from "@/lib/rickandmorty/input";
import type { Episode } from "@/lib/rickandmorty/schemas";
import { extractCharacterIds, sortCharacterNames } from "@/lib/utils/character";

export interface EpisodeCharacters {
  episode: Episode;
  characters: string[];
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
 * Busca os nomes dos personagens de um episódio (por id ou código S01E01),
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
  return {
    episode,
    characters: sortCharacterNames(characters.map((character) => character.name)),
  };
}

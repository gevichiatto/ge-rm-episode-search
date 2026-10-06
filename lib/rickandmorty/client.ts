import { getEnv } from "@/config/env";
import { ZodError } from "zod";
import {
  EpisodeNotFoundError,
  NetworkError,
  RateLimitedError,
  TimeoutError,
  UpstreamError,
} from "@/lib/rickandmorty/errors";
import {
  episodeSchema,
  paginatedEpisodeSchema,
  normalizedCharacterSchema,
} from "@/lib/rickandmorty/schemas";
import type { Character, Episode } from "@/lib/rickandmorty/schemas";

// Resumo seguro para log: nunca despeja o payload nem o erro completo do Zod.
function describeParseError(error: unknown): string {
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const path = issue?.path.join(".") || "(raiz)";
    return `${error.issues.length} issue(s); primeira em ${path}: ${issue?.message}`;
  }
  return error instanceof Error ? error.name : "erro desconhecido";
}

function invalidPayload(context: string, error: unknown): UpstreamError {
  console.error(`Resposta inválida da API (${context}): ${describeParseError(error)}`);
  return new UpstreamError(undefined, "Resposta inválida da API upstream");
}

// Faz a requisição com timeout, traduzindo abort e falhas de transporte em erros tipados.
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const env = getEnv();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), env.RICK_AND_MORTY_API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(
        env.RICK_AND_MORTY_API_TIMEOUT_MS,
        "A requisição excedeu o tempo limite",
      );
    }
    throw new NetworkError("Ocorreu um erro de rede");
  }
}

// Traduz respostas não-2xx em erros tipados. O 404 só vira `notFound` quando o chamador o informa.
function assertOk(response: Response, description: string, notFound?: () => Error): void {
  if (response.status === 404 && notFound) {
    throw notFound();
  }

  if (response.status === 429) {
    throw new RateLimitedError(`Limite de requisições atingido ao buscar ${description}`);
  }

  if (!response.ok) {
    throw new UpstreamError(response.status, `Falha ao buscar ${description}`);
  }
}

// Busca um episódio pelo id da API.
export async function getEpisodeById(id: number): Promise<Episode> {
  const response = await fetchWithTimeout(`${getEnv().RICK_AND_MORTY_API_BASE_URL}/episode/${id}`);

  assertOk(
    response,
    `episódio com id ${id}`,
    () => new EpisodeNotFoundError(`Episódio com id ${id} não encontrado`),
  );

  try {
    return episodeSchema.parse(await response.json());
  } catch (error) {
    throw invalidPayload("episódio", error);
  }
}

// Busca um episódio pelo código (formato S01E01).
export async function getEpisodeByCode(code: string): Promise<Episode> {
  const response = await fetchWithTimeout(
    `${getEnv().RICK_AND_MORTY_API_BASE_URL}/episode?episode=${encodeURIComponent(code)}`,
  );

  assertOk(
    response,
    `episódio com código ${code}`,
    () => new EpisodeNotFoundError(`Episódio com código ${code} não encontrado`),
  );

  let results: Episode[];
  try {
    results = paginatedEpisodeSchema.parse(await response.json()).results;
  } catch (error) {
    throw invalidPayload("episódio por código", error);
  }

  const [first] = results;
  if (!first) {
    throw new EpisodeNotFoundError(`Episódio com código ${code} não encontrado`);
  }
  return first;
}

// Busca vários personagens em uma única requisição.
export async function getCharactersByIds(ids: number[]): Promise<Character[]> {
  // Defesa em profundidade: /character/ sem ids listaria todos os personagens.
  if (ids.length === 0) {
    throw new RangeError("getCharactersByIds exige ao menos um id");
  }
  if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
    throw new RangeError("Os ids de personagem devem ser inteiros positivos");
  }

  const response = await fetchWithTimeout(
    `${getEnv().RICK_AND_MORTY_API_BASE_URL}/character/${ids.join(",")}`,
  );

  assertOk(response, `personagens com ids ${ids.join(",")}`);

  try {
    return normalizedCharacterSchema.parse(await response.json());
  } catch (error) {
    throw invalidPayload("personagens", error);
  }
}

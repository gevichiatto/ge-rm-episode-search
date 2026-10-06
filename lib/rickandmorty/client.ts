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
  return new UpstreamError(undefined, "Invalid response from upstream API");
}

// Helper function to make API requests with timeout
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
      throw new TimeoutError(env.RICK_AND_MORTY_API_TIMEOUT_MS, "Request timed out");
    }
    throw new NetworkError("Network error occurred");
  }
}

// Traduz respostas não-2xx em erros tipados. O 404 só vira `notFound` quando o chamador o informa.
function assertOk(response: Response, description: string, notFound?: () => Error): void {
  if (response.status === 404 && notFound) {
    throw notFound();
  }

  if (response.status === 429) {
    throw new RateLimitedError(`Rate limited while fetching ${description}`);
  }

  if (!response.ok) {
    throw new UpstreamError(response.status, `Failed to fetch ${description}`);
  }
}

// Get episode by ID
export async function getEpisodeById(id: number) {
  const response = await fetchWithTimeout(`${getEnv().RICK_AND_MORTY_API_BASE_URL}/episode/${id}`);

  assertOk(
    response,
    `episode with id ${id}`,
    () => new EpisodeNotFoundError(`Episode with id ${id} not found`),
  );

  try {
    const data = await response.json();
    return episodeSchema.parse(data);
  } catch (error) {
    throw invalidPayload("episódio", error);
  }
}

// Get episode by code (S01E01 format)
export async function getEpisodeByCode(code: string) {
  const response = await fetchWithTimeout(
    `${getEnv().RICK_AND_MORTY_API_BASE_URL}/episode?episode=${encodeURIComponent(code)}`,
  );

  assertOk(
    response,
    `episode with code ${code}`,
    () => new EpisodeNotFoundError(`Episode with code ${code} not found`),
  );

  try {
    const data = await response.json();
    const paginatedData = paginatedEpisodeSchema.parse(data);

    const [first] = paginatedData.results;
    if (!first) {
      throw new EpisodeNotFoundError(`Episode with code ${code} not found`);
    }

    return first;
  } catch (error) {
    // If it's already an EpisodeNotFoundError, re-throw it
    if (error instanceof EpisodeNotFoundError) {
      throw error;
    }

    throw invalidPayload("episódio por código", error);
  }
}

// Get characters by IDs
export async function getCharactersByIds(ids: number[]) {
  // Defesa em profundidade: /character/ sem ids listaria todos os personagens.
  if (ids.length === 0) {
    throw new RangeError("getCharactersByIds requires at least one id");
  }
  if (!ids.every((id) => Number.isInteger(id) && id > 0)) {
    throw new RangeError("Character ids must be positive integers");
  }

  const response = await fetchWithTimeout(
    `${getEnv().RICK_AND_MORTY_API_BASE_URL}/character/${ids.join(",")}`,
  );

  assertOk(response, `characters with ids ${ids.join(",")}`);

  try {
    const data = await response.json();
    const parsedData = normalizedCharacterSchema.parse(data);
    return parsedData;
  } catch (error) {
    throw invalidPayload("personagens", error);
  }
}

import { envSchema } from "@/config/env";
import {
  EpisodeNotFoundError,
  NetworkError,
  TimeoutError,
  UpstreamError,
} from "@/lib/rickandmorty/errors";
import {
  episodeSchema,
  paginatedEpisodeSchema,
  normalizedCharacterSchema,
} from "@/lib/rickandmorty/schemas";

// Load environment variables
const env = envSchema.parse(process.env);

// Helper function to make API requests with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Number(env.RICK_AND_MORTY_API_TIMEOUT_MS));

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

// Get episode by ID
export async function getEpisodeById(id: number) {
  const response = await fetchWithTimeout(`${env.RICK_AND_MORTY_API_BASE_URL}/episode/${id}`);

  if (response.status === 404) {
    throw new EpisodeNotFoundError(`Episode with id ${id} not found`);
  }

  if (!response.ok) {
    throw new UpstreamError(response.status, `Failed to fetch episode with id ${id}`);
  }

  try {
    const data = await response.json();
    return episodeSchema.parse(data);
  } catch (error) {
    console.error("Failed to parse episode response:", error);
    throw new UpstreamError(500, "Invalid response from upstream API");
  }
}

// Get episode by code (S01E01 format)
export async function getEpisodeByCode(code: string) {
  const response = await fetchWithTimeout(
    `${env.RICK_AND_MORTY_API_BASE_URL}/episode?episode=${code}`,
  );

  if (response.status === 404) {
    throw new EpisodeNotFoundError(`Episode with code ${code} not found`);
  }

  if (!response.ok) {
    throw new UpstreamError(response.status, `Failed to fetch episode with code ${code}`);
  }

  try {
    const data = await response.json();
    const paginatedData = paginatedEpisodeSchema.parse(data);

    if (paginatedData.results.length === 0) {
      throw new EpisodeNotFoundError(`Episode with code ${code} not found`);
    }

    return paginatedData.results[0];
  } catch (error) {
    // If it's already an EpisodeNotFoundError, re-throw it
    if (error instanceof EpisodeNotFoundError) {
      throw error;
    }

    console.error("Failed to parse paginated episode response:", error);
    throw new UpstreamError(500, "Invalid response from upstream API");
  }
}

// Get characters by IDs
export async function getCharactersByIds(ids: number[]) {
  const response = await fetchWithTimeout(
    `${env.RICK_AND_MORTY_API_BASE_URL}/character/${ids.join(",")}`,
  );

  if (!response.ok) {
    throw new UpstreamError(
      response.status,
      `Failed to fetch characters with ids ${ids.join(",")}`,
    );
  }

  try {
    const data = await response.json();
    const parsedData = normalizedCharacterSchema.parse(data);
    return parsedData;
  } catch (error) {
    console.error("Failed to parse character response:", error);
    throw new UpstreamError(500, "Invalid response from upstream API");
  }
}

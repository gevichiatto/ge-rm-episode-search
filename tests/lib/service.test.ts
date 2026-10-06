import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "@/lib/rickandmorty/client";
import {
  EpisodeNotFoundError,
  NetworkError,
  RateLimitedError,
  TimeoutError,
  UpstreamError,
  ValidationError,
} from "@/lib/rickandmorty/errors";
import type { Episode } from "@/lib/rickandmorty/schemas";
import { getCharactersByEpisode } from "@/lib/rickandmorty/service";

vi.mock("@/lib/rickandmorty/client");

type Characters = Awaited<ReturnType<typeof client.getCharactersByIds>>;

const API = "https://rickandmortyapi.com/api";

function makeEpisode(characterIds: number[]): Episode {
  return {
    id: 15,
    name: "Total Rickall",
    air_date: "August 9, 2015",
    episode: "S02E04",
    characters: characterIds.map((id) => `${API}/character/${id}`),
    url: `${API}/episode/15`,
    created: "2017-11-10T12:56:34.000Z",
  };
}

function makeCharacters(names: string[]): Characters {
  return names.map((name, index) => ({
    id: index + 1,
    name,
    status: "Alive",
    species: "Human",
    type: "",
    gender: "unknown",
    origin: { name: "Earth", url: `${API}/location/1` },
    location: { name: "Earth", url: `${API}/location/1` },
    image: `${API}/character/avatar/${index + 1}.jpeg`,
    episode: [],
    url: `${API}/character/${index + 1}`,
    created: "2017-11-04T18:48:46.250Z",
  }));
}

describe("getCharactersByEpisode", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("busca por id e ordena os nomes", async () => {
    vi.mocked(client.getEpisodeById).mockResolvedValue(makeEpisode([2, 1, 2]));
    vi.mocked(client.getCharactersByIds).mockResolvedValue(
      makeCharacters(["Summer Smith", "Morty Smith", "Beth Smith"]),
    );

    const result = await getCharactersByEpisode("15");

    expect(client.getEpisodeById).toHaveBeenCalledWith(15);
    expect(client.getCharactersByIds).toHaveBeenCalledWith([2, 1]);
    expect(result.characters.map((c) => c.name)).toEqual([
      "Beth Smith",
      "Morty Smith",
      "Summer Smith",
    ]);
    expect(result.characters[0]?.image).toBe(`${API}/character/avatar/3.jpeg`);
  });

  it("desambigua nomes duplicados com a origem", async () => {
    vi.mocked(client.getEpisodeById).mockResolvedValue(makeEpisode([1, 2, 3]));
    const characters = makeCharacters(["Jerry Smith", "Jerry Smith", "Beth Smith"]);
    const [first, second] = characters;
    if (first && second) {
      first.origin.name = "Earth (C-137)";
      second.origin.name = "Earth (Replacement Dimension)";
    }
    vi.mocked(client.getCharactersByIds).mockResolvedValue(characters);

    const result = await getCharactersByEpisode("6");

    expect(result.characters.map((c) => c.name)).toEqual([
      "Beth Smith",
      "Jerry Smith (Earth (C-137))",
      "Jerry Smith (Earth (Replacement Dimension))",
    ]);
  });

  it("busca por código normalizado", async () => {
    vi.mocked(client.getEpisodeByCode).mockResolvedValue(makeEpisode([1]));
    vi.mocked(client.getCharactersByIds).mockResolvedValue(makeCharacters(["Rick Sanchez"]));

    const result = await getCharactersByEpisode("s02e04");

    expect(client.getEpisodeByCode).toHaveBeenCalledWith("S02E04");
    expect(result.episode.name).toBe("Total Rickall");
    expect(result.characters.map((c) => c.name)).toEqual(["Rick Sanchez"]);
  });

  it("retorna um único personagem como lista", async () => {
    vi.mocked(client.getEpisodeById).mockResolvedValue(makeEpisode([1]));
    vi.mocked(client.getCharactersByIds).mockResolvedValue(makeCharacters(["Rick Sanchez"]));

    const result = await getCharactersByEpisode("1");

    expect(result.characters.map((c) => c.name)).toEqual(["Rick Sanchez"]);
  });

  it("não chama a rota de personagens quando não há personagens", async () => {
    vi.mocked(client.getEpisodeById).mockResolvedValue(makeEpisode([]));

    const result = await getCharactersByEpisode("1");

    expect(result.characters).toEqual([]);
    expect(client.getCharactersByIds).not.toHaveBeenCalled();
  });

  it("lança ValidationError sem chamar a API", async () => {
    await expect(getCharactersByEpisode("abc")).rejects.toBeInstanceOf(ValidationError);
    expect(client.getEpisodeById).not.toHaveBeenCalled();
    expect(client.getEpisodeByCode).not.toHaveBeenCalled();
  });

  it.each([
    ["EpisodeNotFoundError", new EpisodeNotFoundError()],
    ["UpstreamError", new UpstreamError(503)],
    ["NetworkError", new NetworkError()],
    ["TimeoutError", new TimeoutError(10000)],
  ])("propaga %s do episódio", async (_name, error) => {
    vi.mocked(client.getEpisodeById).mockRejectedValue(error);

    await expect(getCharactersByEpisode("15")).rejects.toBe(error);
  });

  it.each([
    ["UpstreamError", new UpstreamError(502)],
    ["RateLimitedError", new RateLimitedError()],
    ["NetworkError", new NetworkError()],
    ["TimeoutError", new TimeoutError(10000)],
  ])("propaga %s dos personagens", async (_name, error) => {
    vi.mocked(client.getEpisodeById).mockResolvedValue(makeEpisode([1]));
    vi.mocked(client.getCharactersByIds).mockRejectedValue(error);

    await expect(getCharactersByEpisode("15")).rejects.toBe(error);
  });
});

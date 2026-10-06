import { describe, expect, it } from "vitest";
import {
  characterSchema,
  episodeSchema,
  normalizedCharacterSchema,
  paginatedEpisodeSchema,
} from "@/lib/rickandmorty/schemas";

const API = "https://rickandmortyapi.com/api";

const character = {
  id: 1,
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: { name: "Earth (C-137)", url: `${API}/location/1` },
  location: { name: "Citadel of Ricks", url: `${API}/location/3` },
  image: `${API}/character/avatar/1.jpeg`,
  episode: [`${API}/episode/1`],
  url: `${API}/character/1`,
  created: "2017-11-04T18:48:46.250Z",
};

const episode = {
  id: 1,
  name: "Pilot",
  air_date: "December 2, 2013",
  episode: "S01E01",
  characters: [`${API}/character/1`],
  url: `${API}/episode/1`,
  created: "2017-11-10T12:56:33.798Z",
};

describe("characterSchema", () => {
  it("aceita origem e localização com url vazia (desconhecida)", () => {
    const result = characterSchema.safeParse({
      ...character,
      origin: { name: "unknown", url: "" },
      location: { name: "unknown", url: "" },
    });

    expect(result.success).toBe(true);
  });

  it("rejeita image que não é URL", () => {
    expect(characterSchema.safeParse({ ...character, image: "rick.jpeg" }).success).toBe(false);
  });

  it("rejeita personagem sem name", () => {
    const { name: _name, ...withoutName } = character;

    expect(characterSchema.safeParse(withoutName).success).toBe(false);
  });
});

describe("normalizedCharacterSchema", () => {
  it("transforma um objeto único em array de um item", () => {
    expect(normalizedCharacterSchema.parse(character)).toEqual([character]);
  });

  it("mantém um array como está", () => {
    const list = [character, { ...character, id: 2, name: "Morty Smith" }];

    expect(normalizedCharacterSchema.parse(list)).toEqual(list);
  });

  it("aceita array vazio", () => {
    expect(normalizedCharacterSchema.parse([])).toEqual([]);
  });

  it("rejeita itens inválidos dentro do array", () => {
    expect(normalizedCharacterSchema.safeParse([character, { id: 2 }]).success).toBe(false);
  });

  it("rejeita valores que não são objeto nem array", () => {
    expect(normalizedCharacterSchema.safeParse("Rick").success).toBe(false);
    expect(normalizedCharacterSchema.safeParse(null).success).toBe(false);
  });
});

describe("episodeSchema", () => {
  it("aceita um episódio válido", () => {
    expect(episodeSchema.parse(episode)).toEqual(episode);
  });

  it("rejeita id não inteiro", () => {
    expect(episodeSchema.safeParse({ ...episode, id: 1.5 }).success).toBe(false);
  });

  it("rejeita url inválida", () => {
    expect(episodeSchema.safeParse({ ...episode, url: "não é url" }).success).toBe(false);
  });
});

describe("paginatedEpisodeSchema", () => {
  const info = { count: 1, pages: 1, next: null, prev: null };

  it("aceita uma página válida", () => {
    expect(paginatedEpisodeSchema.parse({ info, results: [episode] }).results).toHaveLength(1);
  });

  it("aceita next e prev como string", () => {
    const paged = { ...info, next: `${API}/episode?page=2`, prev: `${API}/episode?page=1` };

    expect(paginatedEpisodeSchema.safeParse({ info: paged, results: [] }).success).toBe(true);
  });

  it("rejeita payload sem info", () => {
    expect(paginatedEpisodeSchema.safeParse({ results: [episode] }).success).toBe(false);
  });
});

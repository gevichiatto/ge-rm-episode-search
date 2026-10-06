import { describe, expect, it } from "vitest";
import { extractCharacterIds, sortCharacterNames } from "@/lib/utils/character";

describe("extractCharacterIds", () => {
  it("extrai IDs de URLs válidas", () => {
    const urls = [
      "https://rickandmortyapi.com/api/character/1",
      "https://rickandmortyapi.com/api/character/2",
      "https://rickandmortyapi.com/api/character/3",
    ];
    expect(extractCharacterIds(urls)).toEqual([1, 2, 3]);
  });

  it("ignora URLs malformadas", () => {
    const urls = [
      "https://rickandmortyapi.com/api/character/1",
      "invalid-url",
      "https://rickandmortyapi.com/api/character/2",
    ];
    expect(extractCharacterIds(urls)).toEqual([1, 2]);
  });

  it("remove duplicatas", () => {
    const urls = [
      "https://rickandmortyapi.com/api/character/1",
      "https://rickandmortyapi.com/api/character/1",
      "https://rickandmortyapi.com/api/character/2",
    ];
    expect(extractCharacterIds(urls)).toEqual([1, 2]);
  });

  it("retorna array vazio para URLs vazias", () => {
    expect(extractCharacterIds([])).toEqual([]);
  });
});

describe("sortCharacterNames", () => {
  it("ordena nomes em ordem alfabética", () => {
    const names = ["Morty Smith", "Rick Sanchez", "Summer Smith", "Beth Smith"];
    expect(sortCharacterNames(names)).toEqual([
      "Beth Smith",
      "Morty Smith",
      "Rick Sanchez",
      "Summer Smith",
    ]);
  });

  it("ordena nomes com acentos corretamente", () => {
    const names = ["Zé", "Álvaro", "Carlos", "Beto"];
    expect(sortCharacterNames(names)).toEqual(["Álvaro", "Beto", "Carlos", "Zé"]);
  });

  it("não modifica o array original", () => {
    const names = ["Morty Smith", "Rick Sanchez"];
    const original = [...names];
    sortCharacterNames(names);
    expect(names).toEqual(original);
  });
});

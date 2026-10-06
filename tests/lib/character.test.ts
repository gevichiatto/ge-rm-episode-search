import { describe, expect, it } from "vitest";
import {
  disambiguateNames,
  extractCharacterIds,
  sortByName,
  sortCharacterNames,
} from "@/lib/utils/character";

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

describe("disambiguateNames", () => {
  const char = (name: string, origin: string) => ({ name, origin: { name: origin } });

  it("mantém nomes únicos sem alteração", () => {
    expect(
      disambiguateNames([char("Rick Sanchez", "Earth (C-137)"), char("Morty Smith", "unknown")]),
    ).toEqual(["Rick Sanchez", "Morty Smith"]);
  });

  it("acrescenta a origem somente aos nomes duplicados", () => {
    const result = disambiguateNames([
      char("Jerry Smith", "Earth (C-137)"),
      char("Beth Smith", "Earth (C-137)"),
      char("Jerry Smith", "Earth (Replacement Dimension)"),
    ]);
    expect(result).toEqual([
      "Jerry Smith (Earth (C-137))",
      "Beth Smith",
      "Jerry Smith (Earth (Replacement Dimension))",
    ]);
  });

  it("retorna lista vazia para entrada vazia", () => {
    expect(disambiguateNames([])).toEqual([]);
  });
});

describe("sortByName", () => {
  it("ordena por nome e não modifica a entrada", () => {
    const items = [
      { name: "Morty", image: "b" },
      { name: "Beth", image: "a" },
    ];
    expect(sortByName(items).map((i) => i.image)).toEqual(["a", "b"]);
    expect(items[0]?.name).toBe("Morty");
  });
});

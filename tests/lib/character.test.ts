import { describe, expect, it, vi } from "vitest";
import { disambiguateNames, extractCharacterIds, sortByName } from "@/lib/utils/character";

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

describe("disambiguateNames", () => {
  let nextId = 1;
  const char = (name: string, origin: string, id = nextId++) => ({
    id,
    name,
    origin: { name: origin },
  });

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

  it("numera por id quando nome e origem coincidem", () => {
    const result = disambiguateNames([
      char("Jerry Smith", "Earth", 30),
      char("Beth Smith", "Earth", 5),
      char("Jerry Smith", "Earth", 10),
      char("Jerry Smith", "Mars", 20),
    ]);
    expect(result).toEqual([
      "Jerry Smith (Earth) #2",
      "Beth Smith",
      "Jerry Smith (Earth) #1",
      "Jerry Smith (Mars)",
    ]);
  });

  it("retorna lista vazia para entrada vazia", () => {
    expect(disambiguateNames([])).toEqual([]);
  });
});

describe("sortByName", () => {
  it("ordena nomes em ordem alfabética", () => {
    const names = ["Morty Smith", "Rick Sanchez", "Summer Smith", "Beth Smith"].map((name, id) => ({
      id,
      name,
    }));
    expect(sortByName(names).map((i) => i.name)).toEqual([
      "Beth Smith",
      "Morty Smith",
      "Rick Sanchez",
      "Summer Smith",
    ]);
  });

  it("ordena nomes com acentos corretamente", () => {
    const names = ["Zé", "Álvaro", "Carlos", "Beto"].map((name, id) => ({ id, name }));
    expect(sortByName(names).map((i) => i.name)).toEqual(["Álvaro", "Beto", "Carlos", "Zé"]);
  });

  it("ignora caixa e acentos e não depende do locale do processo", () => {
    const names = ["zélia", "Zeca", "ágata", "Abel", "álvaro"].map((name, id) => ({ id, name }));
    const spy = vi.spyOn(String.prototype, "localeCompare").mockReturnValue(1);
    try {
      expect(sortByName(names).map((i) => i.name)).toEqual([
        "Abel",
        "ágata",
        "álvaro",
        "Zeca",
        "zélia",
      ]);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it("desempata nomes equivalentes pelo id, independente da ordem de entrada", () => {
    const items = [
      { id: 9, name: "Rick" },
      { id: 3, name: "rick" },
      { id: 1, name: "Summer" },
      { id: 5, name: "Rick" },
    ];
    expect(sortByName(items).map((i) => i.id)).toEqual([3, 5, 9, 1]);
    expect(sortByName([...items].reverse()).map((i) => i.id)).toEqual([3, 5, 9, 1]);
  });

  it("ordena por nome e não modifica a entrada", () => {
    const items = [
      { id: 1, name: "Morty", image: "b" },
      { id: 2, name: "Beth", image: "a" },
    ];
    expect(sortByName(items).map((i) => i.image)).toEqual(["a", "b"]);
    expect(items[0]?.name).toBe("Morty");
  });
});

import { describe, expect, it } from "vitest";
import { parseEpisodeInput } from "@/lib/rickandmorty/input";
import { ValidationError } from "@/lib/rickandmorty/errors";

describe("parseEpisodeInput", () => {
  it("retorna ID válido", () => {
    const result = parseEpisodeInput("15");
    expect(result.type).toBe("id");
    // Type assertion to avoid TS error - we know this will be an id type
    expect((result as { id: number }).id).toBe(15);
  });

  it("retorna código válido em maiúsculas", () => {
    const result = parseEpisodeInput("s02e04");
    expect(result.type).toBe("code");
    // Type assertion to avoid TS error - we know this will be a code type
    expect((result as { code: string }).code).toBe("S02E04");
  });

  it("lança ValidationError para entrada vazia", () => {
    expect(() => parseEpisodeInput("")).toThrow(ValidationError);
  });

  it("lança ValidationError para entrada inválida", () => {
    expect(() => parseEpisodeInput("abc")).toThrow(ValidationError);
  });

  it("normaliza zeros à esquerda para o id (comportamento atual)", () => {
    expect((parseEpisodeInput("0051") as { id: number }).id).toBe(51);
  });

  it.each(["52", "0", "99999999999999999999", "1 5", "S1E1", "S01E1", " 15"])(
    "lança ValidationError para %j",
    (value) => {
      expect(() => parseEpisodeInput(value)).toThrow(ValidationError);
    },
  );
});

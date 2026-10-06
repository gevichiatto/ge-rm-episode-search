import { describe, expect, it } from "vitest";
import { parseEpisodeInput, episodeInputSchema } from "../../lib/rickandmorty/input";
import { ValidationError } from "../../lib/rickandmorty/errors";

describe("episodeInputSchema", () => {
  describe("ID numérico válido", () => {
    const validIds = [1, 5, 15, 51];

    for (const id of validIds) {
      it(`aceita ID ${id}`, () => {
        const result = episodeInputSchema.safeParse(id.toString());
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe("id");
          expect(result.data.id).toBe(id);
        }
      });
    }
  });

  describe("ID numérico inválido", () => {
    const invalidIds = ["0", "-1", "0.5", "abc", ""];

    for (const id of invalidIds) {
      it(`rejeita ID "${id}"`, () => {
        const result = episodeInputSchema.safeParse(id);
        expect(result.success).toBe(false);
      });
    }
  });

  describe("Código S01E01 válido", () => {
    const validCodes = ["S01E01", "s01e01", "S12E34", "s12e34"];

    for (const code of validCodes) {
      it(`aceita código "${code}"`, () => {
        const result = episodeInputSchema.safeParse(code);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe("code");
          expect(result.data.code).toBe(code.toUpperCase());
        }
      });
    }
  });

  describe("Código S01E01 inválido", () => {
    const invalidCodes = ["S1E01", "S01E1", "S01E01X", "s0x2e04", "abc", ""];

    for (const code of invalidCodes) {
      it(`rejeita código "${code}"`, () => {
        const result = episodeInputSchema.safeParse(code);
        expect(result.success).toBe(false);
      });
    }
  });
});

describe("parseEpisodeInput", () => {
  it("lança ValidationError para entrada vazia", () => {
    expect(() => parseEpisodeInput("")).toThrow(ValidationError);
  });

  it("lança ValidationError para entrada inválida", () => {
    expect(() => parseEpisodeInput("abc")).toThrow(ValidationError);
  });

  it("retorna ID válido", () => {
    const result = parseEpisodeInput("15");
    expect(result).toEqual({ type: "id", id: 15 });
  });

  it("retorna código válido em maiúsculas", () => {
    const result = parseEpisodeInput("s02e04");
    expect(result).toEqual({ type: "code", code: "S02E04" });
  });
});

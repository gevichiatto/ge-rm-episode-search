import { describe, expect, it } from "vitest";
import { envSchema } from "@/config/env";

describe("envSchema", () => {
  it("usa os padrões quando nenhuma variável é definida", () => {
    expect(envSchema.parse({})).toEqual({
      RICK_AND_MORTY_API_BASE_URL: "https://rickandmortyapi.com/api",
      RICK_AND_MORTY_API_TIMEOUT_MS: 10000,
    });
  });

  it("converte o timeout vindo como string (como em process.env)", () => {
    const env = envSchema.parse({ RICK_AND_MORTY_API_TIMEOUT_MS: "2500" });

    expect(env.RICK_AND_MORTY_API_TIMEOUT_MS).toBe(2500);
  });

  it.each(["0", "-5", "1.5", "abc"])("rejeita timeout inválido: %s", (value) => {
    expect(envSchema.safeParse({ RICK_AND_MORTY_API_TIMEOUT_MS: value }).success).toBe(false);
  });

  it("aceita uma URL base customizada", () => {
    const env = envSchema.parse({ RICK_AND_MORTY_API_BASE_URL: "http://localhost:4000/api" });

    expect(env.RICK_AND_MORTY_API_BASE_URL).toBe("http://localhost:4000/api");
  });

  it("rejeita URL base inválida", () => {
    expect(envSchema.safeParse({ RICK_AND_MORTY_API_BASE_URL: "não é url" }).success).toBe(false);
  });
});

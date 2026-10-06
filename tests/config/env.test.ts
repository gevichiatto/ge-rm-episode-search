import { afterEach, describe, expect, it, vi } from "vitest";
import { envSchema } from "@/config/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  it.each(["http://rickandmortyapi.com/api", "ftp://example.com", "file:///etc/passwd"])(
    "rejeita URL base sem https: %s",
    (value) => {
      expect(envSchema.safeParse({ RICK_AND_MORTY_API_BASE_URL: value }).success).toBe(false);
    },
  );

  it("rejeita http://localhost em produção", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(
      envSchema.safeParse({ RICK_AND_MORTY_API_BASE_URL: "http://localhost:4000/api" }).success,
    ).toBe(false);
  });

  it("remove a barra final da URL base", () => {
    const env = envSchema.parse({ RICK_AND_MORTY_API_BASE_URL: "https://example.com/api/" });

    expect(env.RICK_AND_MORTY_API_BASE_URL).toBe("https://example.com/api");
  });
});

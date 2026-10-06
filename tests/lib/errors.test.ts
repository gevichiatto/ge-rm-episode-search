import { describe, expect, it } from "vitest";
import {
  EpisodeNotFoundError,
  EpisodeSearchError,
  NetworkError,
  RateLimitedError,
  TimeoutError,
  UpstreamError,
  ValidationError,
} from "@/lib/rickandmorty/errors";

describe("EpisodeSearchError", () => {
  const cases = [
    { Ctor: ValidationError, code: "validation", name: "ValidationError" },
    { Ctor: EpisodeNotFoundError, code: "episode-not-found", name: "EpisodeNotFoundError" },
    { Ctor: NetworkError, code: "network", name: "NetworkError" },
    { Ctor: RateLimitedError, code: "rate-limited", name: "RateLimitedError" },
  ] as const;

  for (const { Ctor, code, name } of cases) {
    it(`${name} é uma instância de Error e de EpisodeSearchError com ${code}`, () => {
      const error = new Ctor();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(EpisodeSearchError);
      expect(error.name).toBe(name);
      expect(error.message).toBeTypeOf("string");
      expect(error.message.length).toBeGreaterThan(0);
      expect(error.code).toBe(code);
    });
  }

  it("UpstreamError é uma instância de EpisodeSearchError", () => {
    const error = new UpstreamError(500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EpisodeSearchError);
    expect(error.name).toBe("UpstreamError");
    expect(error.code).toBe("upstream");
  });

  it("TimeoutError é uma instância de EpisodeSearchError", () => {
    const error = new TimeoutError(10000);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EpisodeSearchError);
    expect(error.name).toBe("TimeoutError");
    expect(error.code).toBe("timeout");
  });
});

describe("ValidationError", () => {
  it("aceita mensagem personalizada", () => {
    const error = new ValidationError("mensagem customizada");
    expect(error.message).toBe("mensagem customizada");
  });
});

describe("EpisodeNotFoundError", () => {
  it("aceita mensagem personalizada", () => {
    const error = new EpisodeNotFoundError("episódio não existe");
    expect(error.message).toBe("episódio não existe");
  });
});

describe("UpstreamError", () => {
  it("guarda o status HTTP quando informado", () => {
    expect(new UpstreamError(502).status).toBe(502);
    expect(new UpstreamError(503).status).toBe(503);
  });

  it("deixa undefined sem status (ex.: resposta fora do schema)", () => {
    expect(new UpstreamError().status).toBeUndefined();
  });

  it("usa mensagens padrão com e sem status", () => {
    expect(new UpstreamError(500).message).toContain("500");
    expect(new UpstreamError().message).toContain("formato esperado");
  });

  it("aceita mensagem personalizada", () => {
    expect(new UpstreamError(400, "corpo fora do schema").message).toBe("corpo fora do schema");
  });
});

describe("RateLimitedError", () => {
  it("aceita mensagem personalizada", () => {
    expect(new RateLimitedError("devagar").message).toBe("devagar");
  });
});

describe("NetworkError", () => {
  it("aceita mensagem personalizada", () => {
    expect(new NetworkError("falha de DNS").message).toBe("falha de DNS");
  });
});

describe("TimeoutError", () => {
  it("guarda o tempo limite em ms", () => {
    expect(new TimeoutError(2500).timeoutMs).toBe(2500);
    expect(new TimeoutError(2500).message).toContain("2500");
  });

  it("aceita mensagem personalizada", () => {
    expect(new TimeoutError(100, "estourou o prazo").message).toBe("estourou o prazo");
  });
});

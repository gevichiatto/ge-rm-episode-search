import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCharactersByIds, getEpisodeByCode, getEpisodeById } from "@/lib/rickandmorty/client";
import {
  EpisodeNotFoundError,
  NetworkError,
  TimeoutError,
  UpstreamError,
} from "@/lib/rickandmorty/errors";

const API = "https://rickandmortyapi.com/api";

const episode = {
  id: 15,
  name: "Total Rickall",
  air_date: "August 9, 2015",
  episode: "S02E04",
  characters: [`${API}/character/1`],
  url: `${API}/episode/15`,
  created: "2017-11-10T12:56:34.000Z",
};

function makeCharacter(id: number) {
  return {
    id,
    name: `Character ${id}`,
    status: "Alive",
    species: "Human",
    type: "",
    gender: "unknown",
    origin: { name: "unknown", url: "" },
    location: { name: "Earth", url: `${API}/location/1` },
    image: `${API}/character/avatar/${id}.jpeg`,
    episode: [],
    url: `${API}/character/${id}`,
    created: "2017-11-04T18:48:46.250Z",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  // O client registra no console quando o payload é inválido.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getEpisodeById", () => {
  it("retorna o episódio e chama a URL correta", async () => {
    fetchMock.mockResolvedValue(json(episode));

    await expect(getEpisodeById(15)).resolves.toEqual(episode);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API}/episode/15`);
  });

  it("lança EpisodeNotFoundError em 404", async () => {
    fetchMock.mockResolvedValue(json({ error: "not found" }, 404));

    await expect(getEpisodeById(15)).rejects.toBeInstanceOf(EpisodeNotFoundError);
  });

  it("lança UpstreamError com o status em respostas não-2xx", async () => {
    fetchMock.mockResolvedValue(json({}, 503));

    await expect(getEpisodeById(15)).rejects.toMatchObject({
      constructor: UpstreamError,
      code: "upstream",
      status: 503,
    });
  });

  it("não mascara payload inválido como status 500", async () => {
    fetchMock.mockResolvedValue(json({ ...episode, id: "15" }));

    await expect(getEpisodeById(15)).rejects.toMatchObject({ status: undefined });
  });

  it("registra só um resumo do erro, sem o payload", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(json({ ...episode, id: "segredo-no-payload" }));

    await expect(getEpisodeById(15)).rejects.toBeInstanceOf(UpstreamError);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [message] = errorSpy.mock.calls[0] ?? [];
    expect(message).toContain("primeira em id");
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("segredo-no-payload");
  });

  it("lança UpstreamError quando o JSON é inválido", async () => {
    fetchMock.mockResolvedValue(new Response("<html>", { status: 200 }));

    await expect(getEpisodeById(15)).rejects.toBeInstanceOf(UpstreamError);
  });

  it("lança UpstreamError quando o payload não bate com o schema", async () => {
    fetchMock.mockResolvedValue(json({ ...episode, id: "15" }));

    await expect(getEpisodeById(15)).rejects.toBeInstanceOf(UpstreamError);
  });
});

describe("getEpisodeByCode", () => {
  const page = { info: { count: 1, pages: 1, next: null, prev: null }, results: [episode] };

  it("retorna o primeiro resultado e chama a URL correta", async () => {
    fetchMock.mockResolvedValue(json(page));

    await expect(getEpisodeByCode("S02E04")).resolves.toEqual(episode);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API}/episode?episode=S02E04`);
  });

  it("codifica o código na query string", async () => {
    fetchMock.mockResolvedValue(json({ info: page.info, results: [] }));

    await getEpisodeByCode("S01E01&name=rick#x").catch(() => {});

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API}/episode?episode=S01E01%26name%3Drick%23x`);
  });

  it("lança EpisodeNotFoundError quando results é vazio", async () => {
    fetchMock.mockResolvedValue(json({ ...page, results: [] }));

    await expect(getEpisodeByCode("S09E99")).rejects.toBeInstanceOf(EpisodeNotFoundError);
  });

  it("lança EpisodeNotFoundError em 404", async () => {
    fetchMock.mockResolvedValue(json({ error: "There is nothing here" }, 404));

    await expect(getEpisodeByCode("S09E99")).rejects.toBeInstanceOf(EpisodeNotFoundError);
  });

  it("lança UpstreamError em 500", async () => {
    fetchMock.mockResolvedValue(json({}, 500));

    await expect(getEpisodeByCode("S02E04")).rejects.toMatchObject({ status: 500 });
  });

  it("lança UpstreamError quando o payload não bate com o schema", async () => {
    fetchMock.mockResolvedValue(json({ results: [episode] }));

    await expect(getEpisodeByCode("S02E04")).rejects.toBeInstanceOf(UpstreamError);
  });
});

describe("getCharactersByIds", () => {
  it("normaliza o objeto único (um id) para array", async () => {
    fetchMock.mockResolvedValue(json(makeCharacter(1)));

    const result = await getCharactersByIds([1]);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API}/character/1`);
  });

  it("devolve o array (vários ids) em uma única requisição", async () => {
    fetchMock.mockResolvedValue(json([makeCharacter(1), makeCharacter(2)]));

    const result = await getCharactersByIds([1, 2]);

    expect(result.map((c) => c.id)).toEqual([1, 2]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API}/character/1,2`);
  });

  it("recusa lista vazia sem chamar a API", async () => {
    await expect(getCharactersByIds([])).rejects.toBeInstanceOf(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([[[0]], [[-1]], [[1.5]], [[Number.NaN]]])("recusa ids inválidos %j", async (ids) => {
    await expect(getCharactersByIds(ids)).rejects.toBeInstanceOf(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lança UpstreamError em 5xx", async () => {
    fetchMock.mockResolvedValue(json({}, 502));

    await expect(getCharactersByIds([1, 2])).rejects.toMatchObject({
      constructor: UpstreamError,
      status: 502,
    });
  });

  it("lança UpstreamError quando o payload não bate com o schema", async () => {
    fetchMock.mockResolvedValue(json([{ id: 1 }]));

    await expect(getCharactersByIds([1])).rejects.toBeInstanceOf(UpstreamError);
  });
});

describe("falhas de transporte", () => {
  it("lança NetworkError quando o fetch rejeita", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(getEpisodeById(1)).rejects.toBeInstanceOf(NetworkError);
  });

  it("lança TimeoutError quando a requisição excede o tempo limite", async () => {
    vi.useFakeTimers();
    // Simula um fetch que fica pendente até o AbortSignal disparar.
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError")),
          );
        }),
    );

    const pending = getEpisodeById(1);
    // Registra o handler antes de avançar o relógio, para não gerar rejeição não tratada.
    const assertion = expect(pending).rejects.toMatchObject({
      constructor: TimeoutError,
      code: "timeout",
      timeoutMs: 10000,
    });
    await vi.advanceTimersByTimeAsync(10000);
    await assertion;
  });
});

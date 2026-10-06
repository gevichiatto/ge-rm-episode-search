// Servidor de mock da Rick and Morty API para o E2E.
// As chamadas à API saem do servidor Next, não do navegador, então `page.route`
// não as intercepta: o Next é apontado para este servidor via RICK_AND_MORTY_API_BASE_URL.
import { createServer } from "node:http";
import type { ServerResponse } from "node:http";

const PORT = Number(process.env.MOCK_API_PORT ?? 4010);
const API = "https://rickandmortyapi.com/api";

const CHARACTERS: Record<number, string> = {
  1: "Rick Sanchez",
  2: "Morty Smith",
  3: "Summer Smith",
  4: "Beth Smith",
};

function character(id: number) {
  return {
    id,
    name: CHARACTERS[id],
    status: "Alive",
    species: "Human",
    type: "",
    gender: "unknown",
    origin: { name: "Earth (C-137)", url: "" },
    location: { name: "Earth (C-137)", url: "" },
    image: `${API}/character/avatar/${id}.jpeg`,
    episode: [],
    url: `${API}/character/${id}`,
    created: "2017-11-04T18:48:46.250Z",
  };
}

function episode(id: number, code: string, name: string, characterIds: number[]) {
  return {
    id,
    name,
    air_date: "December 2, 2013",
    episode: code,
    characters: characterIds.map((c) => `${API}/character/${c}`),
    url: `${API}/episode/${id}`,
    created: "2017-11-10T12:56:33.798Z",
  };
}

const EPISODES = [
  episode(1, "S01E01", "Pilot", [2, 1, 4, 3]),
  episode(2, "S01E02", "Lawnmower Dog", [1]),
];

// Ids com falha transitória: respondem 503 na 1ª chamada e normalmente nas seguintes.
const FLAKY_ID = 20;
const failedOnce = new Set<number>();

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const { pathname } = url;

  if (pathname === "/__reset") {
    failedOnce.clear();
    return send(res, 200, { ok: true });
  }
  if (pathname === "/__health") return send(res, 200, { ok: true });

  const episodeById = /^\/episode\/(\d+)$/.exec(pathname);
  if (episodeById) {
    const id = Number(episodeById[1]);
    if (id === FLAKY_ID && !failedOnce.has(id)) {
      failedOnce.add(id);
      return send(res, 503, { error: "unavailable" });
    }
    const found =
      EPISODES.find((e) => e.id === id) ??
      (id === FLAKY_ID ? episode(id, "S02E09", "Intermittent", [1]) : undefined);
    return found ? send(res, 200, found) : send(res, 404, { error: "There is nothing here" });
  }

  if (pathname === "/episode") {
    const code = url.searchParams.get("episode") ?? "";
    const results = EPISODES.filter((e) => e.episode.toLowerCase().includes(code.toLowerCase()));
    if (results.length === 0) return send(res, 404, { error: "There is nothing here" });
    return send(res, 200, {
      info: { count: results.length, pages: 1, next: null, prev: null },
      results,
    });
  }

  const characters = /^\/character\/([\d,]+)$/.exec(pathname);
  if (characters) {
    const ids = (characters[1] ?? "").split(",").map(Number);
    const list = ids.map(character);
    return send(res, 200, list.length === 1 ? list[0] : list);
  }

  send(res, 404, { error: "There is nothing here" });
}).listen(PORT, () => console.error(`mock API em http://localhost:${PORT}`));

import type { EpisodeSearchErrorCode } from "@/lib/rickandmorty/errors";

/** Todo texto visível ao usuário (pt-BR) fica aqui. */
export const messages = {
  title: "Portal de Personagens",
  subtitle: "Escolha um episódio de Rick and Morty e veja quem apareceu nele, em ordem alfabética.",
  searchLabel: "Episódio",
  searchPlaceholder: "Ex.: 1 ou S01E01",
  searchButton: "Abrir portal",
  retry: "Tentar novamente",
  emptyEpisode: "Este episódio não tem personagens cadastrados.",
  resultsCount: (count: number): string => (count === 1 ? "1 personagem" : `${count} personagens`),
  loading: "Buscando personagens...",
  unexpectedError: "Algo deu errado. Tente novamente.",
  notFoundTitle: "Página não encontrada",
  notFoundBack: "Voltar para a busca",
  metadataTitle: "Personagens por episódio | Rick and Morty",
  metadataDescription:
    "Abra um portal para qualquer episódio de Rick and Morty e veja os personagens em ordem alfabética.",
  errors: {
    validation: "Informe um número de episódio válido (ex.: 15) ou um código como S01E01.",
    "episode-not-found": "Episódio não encontrado.",
    timeout: "A busca demorou demais. Tente novamente.",
    network: "Não foi possível acessar o serviço. Verifique sua conexão.",
    "rate-limited": "Muitas requisições. Aguarde um pouco e tente de novo.",
    upstream: "O serviço está indisponível no momento. Tente novamente em instantes.",
  } satisfies Record<EpisodeSearchErrorCode, string>,
};

/** Erros transitórios, para os quais faz sentido oferecer "Tentar novamente". */
export const RETRIABLE_CODES: readonly EpisodeSearchErrorCode[] = [
  "network",
  "timeout",
  "upstream",
  "rate-limited",
];

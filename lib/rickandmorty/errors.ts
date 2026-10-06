/**
 * Códigos estáveis associados a cada erro tipado do módulo de busca.
 *
 * A UI mapeia esses códigos para mensagens amigáveis sem precisar checar
 * `instanceof` em cada ponto de uso.
 */
export type EpisodeSearchErrorCode =
  "validation" | "episode-not-found" | "upstream" | "network" | "timeout" | "rate-limited";

/**
 * Classe-base de todos os erros tipados lançados pelo módulo de busca.
 *
 * Toda instância carrega um `code` estável para o mapeamento de mensagens
 * e um `message` descritivo (em pt-BR) útil em logs.
 */
export abstract class EpisodeSearchError extends Error {
  abstract readonly code: EpisodeSearchErrorCode;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/**
 * Input do usuário inválido (vazio, não numérico, fora de forma).
 *
 * Nenhuma chamada à API é feita quando esse erro é lançado.
 */
export class ValidationError extends EpisodeSearchError {
  override readonly code = "validation" as const;

  constructor(
    message: string = "Entrada inválida. Use um número (ex.: 15) ou um código como S01E01.",
  ) {
    super(message);
  }
}

/** A API respondeu 404 para o episódio solicitado. */
export class EpisodeNotFoundError extends EpisodeSearchError {
  override readonly code = "episode-not-found" as const;

  constructor(message: string = "O episódio solicitado não foi encontrado.") {
    super(message);
  }
}

/**
 * Falha causada pela API upstream:
 *
 * - resposta HTTP com status não-2xx (5xx, demais 4xx; o 429 é `RateLimitedError`) → `status`
 *   carrega o código HTTP recebido;
 * - resposta fora do schema esperado → `status` fica `undefined`.
 */
export class UpstreamError extends EpisodeSearchError {
  override readonly code = "upstream" as const;

  constructor(
    readonly status?: number,
    message?: string,
  ) {
    super(
      message ??
        (status !== undefined
          ? `A requisição à API upstream falhou com status ${status}.`
          : "A resposta da API upstream não corresponde ao formato esperado."),
    );
  }
}

/**
 * Falha de rede: a API upstream não respondeu (DNS, offline, TLS, conexão
 * derrubada) ou respondeu algo fora do formato JSON.
 */
export class NetworkError extends EpisodeSearchError {
  override readonly code = "network" as const;

  constructor(message: string = "Não foi possível alcançar a API upstream.") {
    super(message);
  }
}

/** A requisição à API upstream excedeu o tempo limite e foi abortada. */
export class TimeoutError extends EpisodeSearchError {
  override readonly code = "timeout" as const;

  constructor(
    readonly timeoutMs: number,
    message?: string,
  ) {
    super(message ?? `A requisição à API upstream excedeu o tempo limite de ${timeoutMs} ms.`);
  }
}

/** A API respondeu 429: o limite de requisições foi excedido. */
export class RateLimitedError extends EpisodeSearchError {
  override readonly code = "rate-limited" as const;

  constructor(message: string = "A API upstream limitou as requisições (HTTP 429).") {
    super(message);
  }
}

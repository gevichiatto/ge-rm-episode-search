# Rick and Morty — Personagens por episódio

Uma página única em Next.js: digite o número de um episódio (ou o código `S01E01`) e veja os personagens daquele episódio em ordem alfabética, com a foto de cada um. Os dados vêm da [Rick and Morty API](https://rickandmortyapi.com/documentation).

## Como rodar

Requisitos: Node `24` (veja `.nvmrc`) e [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Nenhuma variável é obrigatória. Para sobrescrever os padrões, copie `.env.example` para `.env.local`:

| Variável                        | Padrão                            | Descrição                                                                     |
| ------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| `RICK_AND_MORTY_API_BASE_URL`   | `https://rickandmortyapi.com/api` | URL base da API (só `https`; `http` apenas para `localhost` fora de produção) |
| `RICK_AND_MORTY_API_TIMEOUT_MS` | `10000`                           | Timeout de cada requisição (ms)                                               |

### Scripts

| Script               | O que faz                                   |
| -------------------- | ------------------------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento                 |
| `pnpm build`         | Build de produção                           |
| `pnpm start`         | Serve o build de produção                   |
| `pnpm lint`          | ESLint                                      |
| `pnpm typecheck`     | `tsc --noEmit`                              |
| `pnpm format`        | Prettier (`format:check` apenas verifica)   |
| `pnpm test`          | Vitest (`test:watch` para modo interativo)  |
| `pnpm test:coverage` | Vitest com relatório de cobertura           |
| `pnpm test:e2e`      | Playwright (fora do `validate`)             |
| `pnpm validate`      | lint + typecheck + cobertura + format:check |

## Como funciona

```
app/page.tsx  →  lib/rickandmorty/service.ts  →  lib/rickandmorty/client.ts  →  rickandmortyapi.com
 (UI, Server        (regras: valida a entrada,       (fetch, timeout, mapeamento
  Component)         ordena, desambigua nomes)        de status, validação Zod)
```

1. A `page` lê `?q=` (`searchParams` é uma Promise no Next 16) e chama o service. A busca fica na URL, então é compartilhável e funciona sem JavaScript no cliente (o formulário é um `GET`).
2. O service valida a entrada **antes** de qualquer chamada de rede, busca o episódio e então **todos** os personagens em **uma única** requisição (`/character/1,2,3`), em vez de uma por personagem.
3. O client traduz falhas em erros tipados e valida toda resposta com Zod. Dado externo é `unknown` até passar pelo schema.
4. A UI recebe ou o resultado, ou um `EpisodeSearchError`, e mostra a mensagem correspondente.

```
app/            páginas e fallbacks (page, layout, loading, error, not-found)
components/     SearchForm, CharacterList, ErrorMessage
config/         env.ts — variáveis de ambiente validadas com Zod
lib/
  messages.ts   todo texto visível ao usuário (pt-BR)
  rickandmorty/ client, service, schemas, errors, input
  utils/        ordenação e desambiguação de nomes
tests/          lib/, config/ e components/ (Vitest)
```

## Decisões

- **"Número do episódio" aceita os dois formatos.** O enunciado é ambíguo, então a busca aceita o **id da API** (`1`–`51`) e o **código** (`S01E01`, sem diferenciar maiúsculas). O custo é baixo: a API já expõe `/episode?episode=` para o código.
- **Só Next.js, sem backend próprio.** Server Components chamam a API pública diretamente; não há API route.
- **Client defensivo.** O código do episódio é codificado na URL, ids inválidos ou vazios são recusados dentro do próprio client e o ambiente só é lido no primeiro uso. Payload inválido vira `UpstreamError` sem status, e o log traz só um resumo do erro.
- **Cabeçalhos de segurança.** `proxy.ts` gera uma CSP com nonce por requisição (`lib/security/csp.ts`; `unsafe-eval` só em dev), e `next.config.ts` define `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS. Sem `upgrade-insecure-requests`, para não quebrar `next start` em `http://localhost`.
- **Zod na borda.** Respostas da API, parâmetros da URL e variáveis de ambiente são validados; os tipos vêm de `z.infer`.
- **A API devolve formatos diferentes** para `/character/{ids}`: objeto para um id, array para vários. O schema normaliza para array. Com zero personagens, `/character/` não é chamado (retornaria a lista inteira).
- **Ordem alfabética com `localeCompare`**, não `.sort()` puro, que ordenaria por code point.
- **Nomes duplicados** (ex.: o episódio 6 tem vários "Jerry Smith") recebem a origem entre parênteses: `Jerry Smith (Earth (C-137))`. Se nome e origem também coincidirem, acrescenta ` #1`, ` #2`… pela ordem do id. Nomes únicos ficam intactos.
- **Imagens via `next/image`**, restritas por `images.remotePatterns` aos avatares da API.
- **Sem cache próprio.** Fica como evolução (ver abaixo), para evitar resultados desatualizados.

## Tratamento de erros

Cada falha vira uma classe tipada (`lib/rickandmorty/errors.ts`) com um `code`, e a UI mostra uma mensagem amigável — nunca status ou stack. Erros transitórios oferecem "Tentar novamente".

| Situação                                     | Erro                   | `code`              | O usuário vê                                  |
| -------------------------------------------- | ---------------------- | ------------------- | --------------------------------------------- |
| Entrada vazia, inválida ou fora do intervalo | `ValidationError`      | `validation`        | Pede um número válido ou código `S01E01`      |
| HTTP 404                                     | `EpisodeNotFoundError` | `episode-not-found` | "Episódio não encontrado."                    |
| Timeout                                      | `TimeoutError`         | `timeout`           | "A busca demorou demais." + tentar novamente  |
| Falha de rede                                | `NetworkError`         | `network`           | "Não foi possível acessar o serviço." + retry |
| HTTP não-2xx, JSON inválido ou falha no Zod  | `UpstreamError`        | `upstream`          | "O serviço está indisponível." + retry        |
| Qualquer outra coisa                         | —                      | —                   | `app/error.tsx`                               |

## Testes e CI

```bash
pnpm test        # Vitest
pnpm test:e2e    # Playwright (sobe um mock da API e um next dev na porta 3100)
pnpm validate    # lint + typecheck + testes + format
```

Os testes (`pnpm test:coverage` gera o relatório em `coverage/` e falha abaixo dos pisos definidos em `vitest.config.mjs`) cobrem validação de entrada, hierarquia de erros, o service (um personagem vs. vários, zero personagens, 404, 5xx, timeout, payload inválido, desambiguação, imagens), os utilitários de ordenação, a CSP e os componentes (Testing Library + jsdom, em `tests/components/`). O E2E (`tests/e2e/`) sobe um servidor de mock da API e um `next dev` próprio (porta 3100, `distDir` separado). O mock é necessário porque as chamadas à API saem do servidor Next, que o `page.route` não intercepta, e o `next dev` porque em produção o client recusa `http://`. Na primeira vez, rode `pnpm exec playwright install chromium`.

A CI (`.github/workflows/ci.yml`) roda em PRs e em `master`: `pnpm typegen`, `pnpm validate` (que roda os testes com cobertura e aplica os pisos, então eles rodam uma única vez) e `pnpm build`; um job separado (`e2e`) roda o Playwright, com cache dos navegadores, fora do `validate`. O workflow tem permissão só de leitura, cancela execuções antigas do mesmo PR e fixa as actions por SHA; o Dependabot (`.github/dependabot.yml`) atualiza dependências npm toda semana e actions todo mês. Hooks do Husky + commitlint impõem commits no formato Conventional Commits.

## Limitações e próximos passos

- Sem cache de resultados; se necessário, `revalidateTag` por episódio.
- Sem paginação: a API aceita um lote de ids, e uma chamada basta para este escopo.
- Apenas pt-BR.

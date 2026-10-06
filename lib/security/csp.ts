/**
 * Monta o valor do header Content-Security-Policy para uma requisição.
 *
 * - `nonce` + `strict-dynamic`: só scripts do Next com o nonce da requisição executam.
 * - `unsafe-eval` e `style-src 'unsafe-inline'` apenas em desenvolvimento (React e overlay do Next).
 * - Imagens passam pelo otimizador do Next (`/_next/image`), então `'self'` basta.
 * - `style-src-attr 'unsafe-inline'`: o `next/image` emite `style="color:transparent"`.
 * - Sem `upgrade-insecure-requests`: quebraria `next start` em http://localhost.
 */
export function buildContentSecurityPolicy(nonce: string, isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Em dev, o overlay/indicador do Next injeta estilos inline sem nonce.
    // Com nonce presente o `unsafe-inline` seria ignorado, então ele o substitui.
    isDev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  return directives.join("; ");
}

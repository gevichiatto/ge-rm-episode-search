/**
 * Extrai IDs de personagens a partir de URLs.
 *
 * @param urls - Array de URLs no formato `https://rickandmortyapi.com/api/character/1`
 * @returns Array de IDs numéricos únicos (sem duplicatas)
 */
export function extractCharacterIds(urls: string[]): number[] {
  const ids = new Set<number>();

  for (const url of urls) {
    // Extrai o ID da URL usando regex
    const match = url.match(/\/(\d+)$/);
    if (match && match[1]) {
      const id = parseInt(match[1], 10);
      if (!isNaN(id)) {
        ids.add(id);
      }
    }
  }

  return Array.from(ids);
}

/**
 * Ordena nomes de personagens em ordem alfabética.
 *
 * @param names - Array de nomes
 * @returns Array de nomes ordenados (usando localeCompare para acentos)
 */
export function sortCharacterNames(names: string[]): string[] {
  return [...names].sort((a, b) => a.localeCompare(b));
}

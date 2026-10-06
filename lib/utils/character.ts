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

/**
 * Gera os nomes exibidos, acrescentando a origem entre parênteses apenas
 * quando o mesmo nome aparece mais de uma vez
 * (ex.: `Jerry Smith (Earth (C-137))`).
 *
 * @param characters - Personagens com `name` e `origin.name`
 * @returns Nomes na mesma ordem de entrada
 */
export function disambiguateNames(
  characters: readonly { name: string; origin: { name: string } }[],
): string[] {
  const counts = new Map<string, number>();
  for (const { name } of characters) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return characters.map(({ name, origin }) =>
    (counts.get(name) ?? 0) > 1 ? `${name} (${origin.name})` : name,
  );
}

/**
 * Ordena itens que possuem `name` em ordem alfabética, sem mutar a entrada.
 */
export function sortByName<T extends { name: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

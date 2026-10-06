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
 * Gera os nomes exibidos, acrescentando a origem entre parênteses apenas
 * quando o mesmo nome aparece mais de uma vez
 * (ex.: `Jerry Smith (Earth (C-137))`).
 *
 * Se mesmo assim houver rótulos idênticos (mesmo nome e mesma origem), acrescenta
 * ` #n`, numerando pela ordem crescente de `id` para o resultado ser estável.
 *
 * @param characters - Personagens com `id`, `name` e `origin.name`
 * @returns Nomes na mesma ordem de entrada
 */
export function disambiguateNames(
  characters: readonly { id: number; name: string; origin: { name: string } }[],
): string[] {
  const nameCounts = new Map<string, number>();
  for (const { name } of characters) {
    nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
  }

  const labels = characters.map(({ name, origin }) =>
    (nameCounts.get(name) ?? 0) > 1 ? `${name} (${origin.name})` : name,
  );

  const labelCounts = new Map<string, number>();
  for (const label of labels) {
    labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
  }

  return labels.map((label, index) => {
    if ((labelCounts.get(label) ?? 0) < 2) return label;
    const self = characters[index];
    const rank =
      characters.filter(
        (other, i) =>
          labels[i] === label &&
          (other.id < (self?.id ?? 0) || (other.id === self?.id && i < index)),
      ).length + 1;
    return `${label} #${rank}`;
  });
}

/**
 * Ordena itens que possuem `name` em ordem alfabética, sem mutar a entrada.
 */
export function sortByName<T extends { name: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

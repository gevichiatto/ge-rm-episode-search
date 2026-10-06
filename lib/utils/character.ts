/**
 * Extrai IDs de personagens a partir de URLs.
 *
 * @param urls - Array de URLs no formato `https://rickandmortyapi.com/api/character/1`
 * @returns Array de IDs numéricos únicos (sem duplicatas)
 */
export function extractCharacterIds(urls: string[]): number[] {
  const ids = new Set<number>();

  for (const url of urls) {
    const digits = /\/(\d+)$/.exec(url)?.[1];
    if (digits) {
      ids.add(Number(digits));
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

  const indexesByLabel = new Map<string, number[]>();
  labels.forEach((label, index) => {
    indexesByLabel.set(label, [...(indexesByLabel.get(label) ?? []), index]);
  });

  const result = [...labels];
  for (const [label, indexes] of indexesByLabel) {
    if (indexes.length < 2) continue;
    // Numera por id crescente (empate: ordem de entrada) para o resultado ser estável.
    const ranked = [...indexes].sort((a, b) => (characters[a]?.id ?? 0) - (characters[b]?.id ?? 0));
    ranked.forEach((index, rank) => {
      result[index] = `${label} #${rank + 1}`;
    });
  }
  return result;
}

// Locale fixo (o mesmo da UI): `localeCompare` sem locale usa o do runtime e a ordem variaria
// entre ambientes. `sensitivity: "base"` ignora caixa e acentos na comparação.
const nameCollator = new Intl.Collator("pt-BR", { sensitivity: "base" });

/**
 * Ordena itens que possuem `name` e `id` em ordem alfabética (collator `pt-BR`, sem
 * diferenciar caixa ou acentos), sem mutar a entrada. Nomes equivalentes são desempatados
 * pelo `id` crescente, então a ordem não depende da ordem em que a API devolveu os itens.
 */
export function sortByName<T extends { id: number; name: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => nameCollator.compare(a.name, b.name) || a.id - b.id);
}

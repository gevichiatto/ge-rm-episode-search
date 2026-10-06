import { z } from "zod";
import { ValidationError } from "../rickandmorty/errors";

/**
 * Schema Zod para validar a entrada do usuário.
 *
 * Aceita:
 * - dígitos válidos (sem `0`, sem sinal); zeros à esquerda são normalizados (`0051` → 51)
 * - `S\d{2}E\d{2}` (case-insensitive, normaliza para `S02E04`)
 *
 * Rejeita:
 * - vazio
 * - `0`
 * - `-1`
 * - `abc`
 * - `1.5`
 * - `s0x2e04`
 * - `S2E04` (sem padding)
 */
export const episodeInputSchema = z.union([
  // ID numérico (1-51)
  z
    .string()
    .regex(/^\d+$/, "O ID do episódio deve ser um número inteiro positivo.")
    .transform((id) => parseInt(id, 10))
    .refine((id) => id >= 1 && id <= 51, {
      message: "O ID do episódio deve estar entre 1 e 51.",
    })
    .transform((id) => ({ type: "id" as const, id })),

  // Código S01E01 (case-insensitive)
  z
    .string()
    .regex(/^S\d{2}E\d{2}$/i, "O código do episódio deve seguir o formato S01E01.")
    .transform((code) => code.toUpperCase())
    .transform((code) => ({ type: "code" as const, code })),
]);

/**
 * Tipo inferido do schema de input.
 */
export type EpisodeInput = z.infer<typeof episodeInputSchema>;

/**
 * Valida a entrada do usuário e retorna o tipo e valor normalizado.
 *
 * @param input - String de entrada da URL searchParam
 * @returns Objeto com `type` ("id" ou "code") e o valor normalizado
 * @throws ValidationError - Se a entrada for inválida
 */
export function parseEpisodeInput(input: string): EpisodeInput {
  if (!input) {
    throw new ValidationError("Informe um número do episódio (ex.: 15) ou um código como S01E01.");
  }

  const result = episodeInputSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(result.error?.issues?.[0]?.message ?? "Entrada inválida.");
  }

  return result.data;
}

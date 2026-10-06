import { z } from "zod";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * `https:` sempre. `http:` só para localhost e fora de produção (mock local).
 */
function isAllowedBaseUrl(value: string): boolean {
  // O refine também roda quando `url()` falha, então não pode lançar.
  if (!URL.canParse(value)) return true;
  const url = new URL(value);
  if (url.protocol === "https:") return true;
  return (
    url.protocol === "http:" &&
    LOCAL_HOSTS.has(url.hostname) &&
    process.env.NODE_ENV !== "production"
  );
}

export const envSchema = z.object({
  RICK_AND_MORTY_API_BASE_URL: z
    .string()
    .url()
    .refine(isAllowedBaseUrl, { message: "A URL base deve usar https." })
    .transform((value) => value.replace(/\/+$/, ""))
    .default("https://rickandmortyapi.com/api"),
  RICK_AND_MORTY_API_TIMEOUT_MS: z.coerce.number().int().min(1).default(10000),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Lê e valida o ambiente na primeira chamada (sem efeito colateral na importação).
 */
export function getEnv(): Env {
  cached ??= envSchema.parse(process.env);
  return cached;
}

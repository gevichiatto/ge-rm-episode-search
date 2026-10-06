import { z } from "zod";

export const envSchema = z.object({
  RICK_AND_MORTY_API_BASE_URL: z.string().url().default("https://rickandmortyapi.com/api"),
  RICK_AND_MORTY_API_TIMEOUT_MS: z.coerce.number().int().min(1).default(10000),
});

export type Env = z.infer<typeof envSchema>;

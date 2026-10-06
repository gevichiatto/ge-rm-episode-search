import { z } from "zod";

// Episode schema
export const episodeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  air_date: z.string(),
  episode: z.string(),
  characters: z.array(z.string()),
  url: z.string().url(),
  created: z.string(),
});

// Paginated episode response schema
export const paginatedEpisodeSchema = z.object({
  info: z.object({
    count: z.number().int(),
    pages: z.number().int(),
    next: z.string().nullable(),
    prev: z.string().nullable(),
  }),
  results: z.array(episodeSchema),
});

// Character schema
export const characterSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: z.string(),
  species: z.string(),
  type: z.string(),
  gender: z.string(),
  origin: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  location: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  image: z.string().url(),
  episode: z.array(z.string()),
  url: z.string().url(),
  created: z.string(),
});

// Helper to normalize character response (single object or array)
export const normalizedCharacterSchema = z
  .union([characterSchema, z.array(characterSchema)])
  .transform((data) => {
    if (Array.isArray(data)) {
      return data;
    }
    return [data];
  });

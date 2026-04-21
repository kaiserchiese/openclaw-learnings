import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const patterns = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/patterns' }),
  schema: z.object({
    title: z.string(),
  }),
});

const useCases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/use-cases' }),
  schema: z.object({
    title: z.string(),
  }),
});

const gotchas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gotchas' }),
  schema: z.object({
    title: z.string(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  patterns,
  'use-cases': useCases,
  gotchas,
  pages,
};

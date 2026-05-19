import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const status = z.enum(['draft', 'review', 'published']);

const baseEditorial = {
  title: z.string().default(''),
  description: z.string().default(''),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  status: status.default('draft'),
  sourceIds: z.array(z.string()).default([]),
  relatedNoteIds: z.array(z.string()).default([]),
  imageGuide: z.string().default(''),
  publishPotential: z.number().min(1).max(5).default(3),
  updatedAt: z.coerce.date().default(() => new Date()),
};

const rawNotes = defineCollection({
  loader: glob({ base: './src/content/raw-notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    category: z.string().default('미분류'),
    tags: z.array(z.string()).default([]),
    source: z.string().default(''),
    author: z.string().default(''),
    url: z.url().optional(),
    capturedAt: z.coerce.date().optional(),
  }),
});

const insights = defineCollection({
  loader: glob({ base: './src/content/insights', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...baseEditorial,
    sourceUrl: z.string().default(''),
    coreSentence: z.string(),
    originalNote: z.string().default(''),
    myThought: z.string().default(''),
    source: z.string().default(''),
    checklist: z.array(z.string()).default([]),
  }),
});

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...baseEditorial,
    sourceUrl: z.string().default(''),
    coreSentence: z.string(),
    source: z.string().default(''),
    relatedSources: z.array(z.string()).default([]),
    myThought: z.string().default(''),
    checklist: z.array(z.string()).default([]),
    heroStyle: z.enum(['text', 'image', 'split']).default('text'),
    readingMinutes: z.number().min(1).default(5),
  }),
});

const collectionPlans = defineCollection({
  loader: glob({ base: './src/content/collections', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().default(''),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    status: status.default('draft'),
    insightIds: z.array(z.string()).default([]),
    articleIds: z.array(z.string()).default([]),
    sourceIds: z.array(z.string()).default([]),
    imageGuide: z.string().default(''),
    publishPotential: z.number().min(1).max(5).default(3),
    updatedAt: z.coerce.date().default(() => new Date()),
  }),
});

const references = defineCollection({
  loader: glob({ base: './src/content/references', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    sourceType: z.enum(['book', 'article', 'video', 'podcast', 'lecture', 'website', 'unknown']).default('unknown'),
    creator: z.string().default(''),
    url: z.url().optional(),
    category: z.string().default('미분류'),
    tags: z.array(z.string()).default([]),
    noteIds: z.array(z.string()).default([]),
    reliability: z.enum(['primary', 'secondary', 'personal', 'unknown']).default('unknown'),
    updatedAt: z.coerce.date().default(() => new Date()),
  }),
});

export const collections = {
  rawNotes,
  insights,
  articles,
  collections: collectionPlans,
  references,
};

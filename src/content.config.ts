import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		github: z.string().optional()
	})
});

const writings = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/writings' }),
	schema: z.object({
		title: z.string(),
		longTitle: z.string().optional(),
		date: z.string(),
		snippet: z.string()
	})
});

export const collections = { projects, writings };

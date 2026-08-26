export interface Writing {
	title: string;
	longTitle?: string;
	date: string;
	snippet: string;
	file: string;
}

// Legacy SvelteKit glob replaced by Astro content collections.
// Use `getCollection('writings')` in Astro components instead.
// Kept for reference; not used by Astro pages.
export const recentWritings: Writing[] = [];

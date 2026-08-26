// Helpers to generate markdown for content-negotiation.
// Each page imports its helper and returns Response when Astro.locals.prefersMarkdown.

export function indexMarkdown(
	visibleWritings: { title: string; file: string; snippet?: string | null; date: string }[],
	visibleProjects: { title: string; id: string; shortDescription?: string | null }[]
): string {
	const writingsList = visibleWritings
		.map((w) => `- [${w.title}](https://kirkr.xyz/writing/${w.file}) — ${w.snippet ?? ''} (${w.date})`)
		.join('\n');
	const projectsList = visibleProjects
		.map((p) => `- [${p.title}](https://kirkr.xyz/project/${p.id}) — ${p.shortDescription ?? ''}`)
		.join('\n');

	return `# kirkr.xyz

I'm a first year CompE student at Warwick. I enjoy C and TypeScript, and web tech more generally; this site is built on Astro. I'm also interested in politics, philosophy, economics and art - particularly Dutch.

## Writings

${writingsList}

[All writings](https://kirkr.xyz/writings)

## Projects

${projectsList}

[All projects](https://kirkr.xyz/projects)

## Collections

- [Art](https://kirkr.xyz/art)
- [Photography](https://kirkr.xyz/photography)
- [Books](https://kirkr.xyz/books)
- [Films](https://kirkr.xyz/films)
`;
}

export function writingsMarkdown(
	allWritings: { file: string; title: string; date: string; snippet?: string }[]
): string {
	const groups: Record<string, typeof allWritings> = {};
	for (const w of allWritings) {
		const y = new Date(w.date).getFullYear().toString();
		(groups[y] ??= []).push(w);
	}
	const years = Object.keys(groups).sort((a, b) => b.localeCompare(a));
	let out = `# Writings\n\n`;
	for (const y of years) {
		out += `## ${y}\n\n`;
		for (const w of groups[y]!) {
			out += `- [${w.title}](https://kirkr.xyz/writing/${w.file}) — ${w.snippet ?? ''} (${w.date})\n`;
		}
		out += `\n`;
	}
	return out;
}

export function projectsMarkdown(
	projects: { id: string; title: string; shortDescription?: string | null; firstCommit: string }[]
): string {
	let out = `# Projects\n\n`;
	for (const p of projects) {
		out += `- [${p.title}](https://kirkr.xyz/project/${p.id}) — ${p.shortDescription ?? ''} (${p.firstCommit})\n`;
	}
	return out;
}

export function artMarkdown(
	entries: { id: string; title: string; description?: string; data: [string, string][] }[]
): string {
	let out = `# Art\n\nCurated artworks. IIIF imagery via museum APIs.\n\n`;
	for (const e of entries) {
		const artist = e.data.find(([k]) => k === 'artist')?.[1] ?? '';
		const year = e.data.find(([k]) => k === 'year')?.[1] ?? '';
		out += `- **${e.title}**${artist ? ` — ${artist}` : ''}${year ? ` (${year})` : ''}\n`;
		if (e.description) out += `  ${e.description}\n`;
	}
	return out;
}

export function photographyMarkdown(cities: string[]): string {
	let out = `# Photography\n\n`;
	for (const c of cities) {
		const slug = c.toLowerCase().replace(/\s+/g, '-');
		out += `- [${c}](https://kirkr.xyz/photography#${slug})\n`;
	}
	out += `\nImages load from Cloudinary, grouped by city.\n`;
	return out;
}

export function booksMarkdown(): string {
	return `# Books\n\nBooks are loaded client-side from https://hardcover.kirkr.xyz.\n\n- View the full list in your browser at https://kirkr.xyz/books\n- Data source: OpenLibrary via Hardcover\n`;
}

export function filmsMarkdown(): string {
	return `# Films\n\nFilms are loaded client-side from Letterboxd RSS via https://letterboxd.kirkr.xyz/kirkr101/rss/.\n\n- View the full list in your browser at https://kirkr.xyz/films\n`;
}

export function notFoundMarkdown(): string {
	return `# 404 — Not Found\n\nThe page you're looking for doesn't exist.\n\n- [Home](https://kirkr.xyz/)\n- [Writings](https://kirkr.xyz/writings)\n- [Projects](https://kirkr.xyz/projects)\n- Sitemap: https://kirkr.xyz/sitemap.xml\n- Full text: https://kirkr.xyz/llms-full.txt\n`;
}

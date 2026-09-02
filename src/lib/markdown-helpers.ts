// Helpers to generate markdown for content-negotiation.
// Each page imports its helper and returns Response when Astro.locals.prefersMarkdown.

export function indexMarkdown(): string {
	return `# kirkr.xyz

I'm a first year CompE student at Warwick. I enjoy C and TypeScript, and web tech more generally; this site is built on Astro. I'm also interested in politics, philosophy, economics and art - particularly Dutch.

## Navigation

- [Projects](https://kirkr.xyz/projects)
- [Writings](https://kirkr.xyz/writings)
- [About](https://kirkr.xyz/about)
- [GitHub](https://github.com/KIRKR101)

## Collections

- [Art](https://kirkr.xyz/art)
- [Photography](https://kirkr.xyz/photography)
- [Right now](https://kirkr.xyz/current)
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
		out += `- [${c}](https://kirkr.xyz/photography/${slug})\n`;
	}
	out += `\nImages load from Cloudinary, grouped by city.\n`;
	return out;
}

export function notFoundMarkdown(): string {
	return `# 404 — Not Found\n\nThe page you're looking for doesn't exist.\n\n- [Home](https://kirkr.xyz/)\n- [Writings](https://kirkr.xyz/writings)\n- [Projects](https://kirkr.xyz/projects)\n- Sitemap: https://kirkr.xyz/sitemap.xml\n- Full text: https://kirkr.xyz/llms-full.txt\n`;
}

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import remarkFootnotes from 'remark-footnotes';
import { unified } from '@astrojs/markdown-remark';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

function sitemap() {
	return {
		name: 'generated-sitemap',
		hooks: {
			/** @param {{ pages: { pathname: string }[]; dir: URL }} build */
			'astro:build:done': (build) => {
				const { pages, dir } = build;
				const paths = [...pages]
					.map((page) => page.pathname)
					.filter((pathname) => pathname !== '/404' && pathname !== '/404/');
				const urls = [...new Set(paths)].sort().map((pathname) => `\t<url>\n\t\t<loc>https://kirkr.xyz${pathname}</loc>\n\t</url>`);
				const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
				writeFileSync(fileURLToPath(new URL('sitemap.xml', dir)), xml);
			}
		}
	};
}

// https://astro.build/config
export default defineConfig({
	publicDir: './static',
	outDir: './dist',
	output: 'server',
	adapter: cloudflare({
		imageService: 'cloudflare'
	}),
	build: {
		inlineStylesheets: 'always'
	},
	site: 'https://kirkr.xyz',
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()]
	},
	markdown: {
		// @ts-expect-error - remark-footnotes Node vs Root transformer mismatch
		processor: unified({ remarkPlugins: [remarkFootnotes] }),
		syntaxHighlight: false
	}
});

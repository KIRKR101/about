import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import remarkFootnotes from 'remark-footnotes';
import { unified } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
	publicDir: './static',
	outDir: './dist',
	output: 'server',
	adapter: cloudflare({
		imageService: 'cloudflare'
	}),
	site: 'https://kirkr.xyz',
	integrations: [mdx()],
	vite: {
		plugins: [tailwindcss()]
	},
	markdown: {
		// @ts-expect-error - remark-footnotes Node vs Root transformer mismatch
		processor: unified({ remarkPlugins: [remarkFootnotes] }),
		syntaxHighlight: false
	}
});

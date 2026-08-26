import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import remarkFootnotes from 'remark-footnotes';

// https://astro.build/config
export default defineConfig({
	publicDir: './static',
	outDir: './dist',
	output: 'server',
	adapter: cloudflare({
		imageService: 'cloudflare',
		platformProxy: {
			enabled: true
		}
	}),
	site: 'https://kirkr.xyz',
	integrations: [mdx({ remarkPlugins: [remarkFootnotes] })],
	vite: {
		// @ts-expect-error - tailwindcss Vite plugin HotUpdatePluginContext vs MinimalPluginContext with exactOptionalPropertyTypes
		plugins: [tailwindcss()]
	},
	markdown: {
		// @ts-expect-error - remark-footnotes Node vs Root transformer mismatch
		remarkPlugins: [remarkFootnotes],
		syntaxHighlight: false
	}
});

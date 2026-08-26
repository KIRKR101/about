import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import remarkFootnotes from 'remark-footnotes';

// https://astro.build/config
export default defineConfig({
	publicDir: './static',
	outDir: './dist',
	output: 'static',
	site: 'https://kirkr.xyz',
	integrations: [
		mdx({
			remarkPlugins: [remarkFootnotes]
		})
	],
	vite: {
		plugins: [tailwindcss()]
	},
	markdown: {
		remarkPlugins: [remarkFootnotes],
		syntaxHighlight: false
	}
});

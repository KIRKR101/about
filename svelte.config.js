import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import remarkFootnotes from 'remark-footnotes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		{
			markup({ content, filename }) {
				if (!filename?.endsWith('.md')) return { code: content };

				let transformed = content;

				// Transforms Obsidian-style wiki image syntax to standard Markdown:
				// ![[filename|alt]] → ![alt](/writing/filename)
				transformed = transformed.replace(
					/!\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g,
					(_, file, alt) => `![${alt ?? ''}](/writing/${file})`
				);

				// Transforms ```html code blocks into raw HTML:
				transformed = transformed.replace(
					/```html\r?\n([\s\S]*?)\r?\n```/g,
					(_, html) => `<div class="html-block">{@html ${JSON.stringify(html)}}</div>`
				);

				// Inlines SVG files referenced in Markdown as embedded HTML elements.
				transformed = transformed.replace(
					/^!\[([^\]]*)\]\((\/?writing\/[^)]+\.svg)\)\s*$/gm,
					(match, _alt, src) => {
						const fileName = src.replace(/^\/?writing\//, '');
						try {
							const svgPath = join('static', 'writing', fileName);
							const svgContent = readFileSync(svgPath, 'utf8');
							const altText = _alt ?? '';
							return `<div class="svg-container mb-2" role="img" aria-label="${altText}">{@html ${JSON.stringify(svgContent)}}</div>\n\n`;
						} catch (err) {
							console.error(`Error loading SVG ${fileName}:`, err);
							return match;
						}
					}
				);

				return { code: transformed };
			}
		},
		mdsvex({
			extensions: ['.md'],
			smartypants: false,
			remarkPlugins: [remarkFootnotes],
			layout: {
				_: resolve(__dirname, './src/lib/components/WritingLayout.svelte').replace(/\\/g, '/'),
				ProjectLayout: resolve(__dirname, './src/lib/components/ProjectLayout.svelte').replace(
					/\\/g,
					'/'
				)
			}
		})
	],
	kit: {
		adapter: adapter({
			fallback: undefined,
			pages: 'public',
			assets: 'public',
			precompress: true,
			strict: false
		}),
		prerender: {
			entries: ['*'],
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		}
	}
};

export default config;

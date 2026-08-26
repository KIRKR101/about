/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		prefersMarkdown: boolean;
	}
}

declare module 'markdown-it-footnote' {
	const footnote: import('markdown-it').PluginSimple;
	export default footnote;
}

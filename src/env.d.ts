/// <reference types="astro/client" />

declare module 'markdown-it-footnote' {
	const footnote: import('markdown-it').PluginSimple;
	export default footnote;
}

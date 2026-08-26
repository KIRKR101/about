import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import { readFileSync } from 'fs';
import { join } from 'path';

const md = new MarkdownIt({ html: true, linkify: true, typographer: false }).use(footnote);

export function preprocessMarkdown(content: string, fileName?: string): string {
	let transformed = content;

	// Transforms Obsidian-style wiki image syntax to standard Markdown:
	// ![[filename|alt]] → ![alt](/writing/filename)
	transformed = transformed.replace(
		/!\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g,
		(_, file, alt) => `![${alt ?? ''}](/writing/${file})`,
	);

	// Transforms ```html code blocks into raw HTML:
	transformed = transformed.replace(
		/```html\r?\n([\s\S]*?)\r?\n```/g,
		(_, html) => `<div class="html-block">${html}</div>`,
	);

	// Inlines SVG files referenced in Markdown as embedded HTML elements.
	transformed = transformed.replace(
		/^!\[([^\]]*)\]\((\/?writing\/[^)]+\.svg)\)\s*$/gm,
		(match, _alt, src) => {
			const fileName = src.replace(/^\/?writing\//, '');
			try {
				const svgPath = join(process.cwd(), 'static', 'writing', fileName);
				const svgContent = readFileSync(svgPath, 'utf8');
				const altText = _alt ?? '';
				return `<div class="svg-container mb-2" role="img" aria-label="${altText}">${svgContent}</div>\n\n`;
			} catch {
				return match;
			}
		},
	);

		// Transform Svelte Carousel components to SSR HTML matching Carousel.svelte 1:1
	// <Carousel images={[...]} captions={[...]} height="..." />
	function escapeHtmlAttr(s: string) {
		return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
	function parseJsArrayLiteral(src: string): string[] {
		// Try to evaluate as JS array literal (handles single quotes, trailing commas)
		// This mirrors how Svelte parses the prop: it's a JS expression
		try {
			// Use Function to evaluate safely (markdown is trusted)
			// eslint-disable-next-line no-new-func
			const fn = new Function(`return (${src})`);
			const val = fn();
			if (Array.isArray(val)) return val.map(String);
		} catch {}
		// Fallback: naive parse
		try {
			const json = src.replace(/'/g, '"').replace(/,\s*]/g, ']');
			const parsed = JSON.parse(json);
			if (Array.isArray(parsed)) return parsed.map(String);
		} catch {}
		return [];
	}
	function buildCarouselHtml(imagesSrc: string, captionsSrc: string | undefined, height: string | undefined) {
		const images = parseJsArrayLiteral(imagesSrc);
		const captions = captionsSrc ? parseJsArrayLiteral(captionsSrc) : [];
		const h = height || 'h-[320px] md:h-[400px]';
		if (images.length === 0) return '';
		const firstCaption = captions[0] || '';
		const firstAlt = firstCaption || `Image 1`;
		const escapedImagesJson = JSON.stringify(images).replace(/'/g, '&#39;');
		const escapedCaptionsJson = JSON.stringify(captions).replace(/'/g, '&#39;');
		const hasMultiple = images.length > 1;

		// Build inner HTML matching Carousel.svelte exactly for 1:1 styles
		const prevBtn = hasMultiple
			? `<button type="button" data-carousel-prev class="absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 disabled:cursor-default disabled:opacity-40 md:h-11 md:w-11" aria-label="Previous image"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" /></svg></button>`
			: '';
		const nextBtn = hasMultiple
			? `<button type="button" data-carousel-next class="absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 disabled:cursor-default disabled:opacity-40 md:h-11 md:w-11" aria-label="Next image"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" /></svg></button>`
			: '';
		const counter = hasMultiple
			? `<div data-carousel-counter class="absolute right-3 bottom-3 font-mono text-[10px] tracking-[0.18em] text-white/40 select-none">${1} / ${images.length}</div>`
			: '';
		const figcaption = firstCaption
			? `<figcaption data-carousel-caption class="mt-3 text-center font-mono text-[11px] leading-relaxed text-ink-70">${escapeHtmlAttr(firstCaption)}</figcaption>`
			: `<figcaption data-carousel-caption class="mt-3 text-center font-mono text-[11px] leading-relaxed text-ink-70" style="display:none"></figcaption>`;

		// Outer figure matches Carousel.svelte: <figure class="my-10"><div class="relative w-full overflow-hidden rounded-sm border border-bd bg-frame {height}">...</div>...</figure>
		return `<figure class="my-10" data-carousel data-images="${escapeHtmlAttr(escapedImagesJson)}" data-captions="${escapeHtmlAttr(escapedCaptionsJson)}" data-height="${escapeHtmlAttr(h)}"><div class="relative w-full overflow-hidden rounded-sm border border-bd bg-frame ${h}"><button type="button" data-carousel-open class="group block h-full w-full cursor-zoom-in" aria-label="View image 1 in lightbox: ${escapeHtmlAttr(firstCaption)}"><img data-carousel-image class="m-0 h-full w-full object-contain transition-all duration-300 group-hover:brightness-105" src="${escapeHtmlAttr(images[0]!)}" alt="${escapeHtmlAttr(firstAlt)}" loading="lazy" decoding="async" /></button>${prevBtn}${nextBtn}${counter}</div>${figcaption}</figure>`;
	}

	transformed = transformed.replace(
		/<Carousel\s+images=\{(\[[\s\S]*?\])\}\s*captions=\{(\[[\s\S]*?\])\}\s*height="([^"]*)"\s*\/>/g,
		(_, images, captions, height) => buildCarouselHtml(images, captions, height),
	);
	transformed = transformed.replace(
		/<Carousel\s+images=\{(\[[\s\S]*?\])\}\s*captions=\{(\[[\s\S]*?\])\}\s*\/>/g,
		(_, images, captions) => buildCarouselHtml(images, captions, undefined),
	);
	transformed = transformed.replace(
		/<Carousel\s+images=\{(\[[\s\S]*?\])\}\s*\/>/g,
		(_, images) => buildCarouselHtml(images, undefined, undefined),
	);

	// Remove Svelte script blocks
	transformed = transformed.replace(/<script>[\s\S]*?<\/script>/g, '');

	return transformed;
}

export function renderMarkdown(markdown: string): string {
	let html = md.render(markdown);

	// Port markdown-it-footnote output 1:1 to match original Svelte/mdsvex + remark-footnotes
	// Svelte output: <sup id="fnref-1"><a href="#fn-1" class="footnote-ref">1</a></sup>
	// markdown-it:   <sup class="footnote-ref"><a href="#fn1" id="fnref1">[1]</a></sup>
	html = html.replace(
		/<sup class="footnote-ref"><a href="#fn(\d+)" id="fnref(\d+)">\[(\d+)\]<\/a><\/sup>/g,
		'<sup id="fnref-$1"><a href="#fn-$1" class="footnote-ref">$3</a></sup>',
	);
	// Fallback for any other digit sequences (in case of non-numeric footnotes)
	html = html.replace(
		/<sup class="footnote-ref"><a href="#fn([^"]+)" id="fnref([^"]+)">\[([^\]]+)\]<\/a><\/sup>/g,
		'<sup id="fnref-$2"><a href="#fn-$1" class="footnote-ref">$3</a></sup>',
	);

	// Remove markdown-it's outer footnotes separator - on main there is only the
	// footnotes container border-top (hr inside is hidden via CSS), not two borders.
	html = html.replace(/<hr class="footnotes-sep"[^>]*>\s*/g, '');

	// Svelte: <div class="footnotes"><hr> <ol><li id="fn-1">
	// markdown-it: <section class="footnotes">\n<ol class="footnotes-list">\n<li id="fn1" class="footnote-item"><p>
	html = html.replace(
		/<section class="footnotes">\s*<ol class="footnotes-list">/g,
		'<div class="footnotes"><hr> <ol>',
	);
	html = html.replace(/<\/ol>\s*<\/section>/g, '</ol></div>');

	// Fix li: <li id="fn1" class="footnote-item"><p> -> <li id="fn-1">
	html = html.replace(/<li id="fn(\d+)" class="footnote-item"><p>/g, '<li id="fn-$1">');
	html = html.replace(/<li id="fn([^"]+)" class="footnote-item"><p>/g, '<li id="fn-$1">');
	// Close li: </p>\n</li> -> </li>
	html = html.replace(/<\/p>\s*<\/li>/g, '</li>');

	// Fix backref href and text: href="#fnref1" class="footnote-backref">↩︎ -> href="#fnref-1" class="footnote-backref">↩
	html = html.replace(/href="#fnref(\d+)" class="footnote-backref">↩︎/g, 'href="#fnref-$1" class="footnote-backref">↩');
	html = html.replace(/href="#fnref([^"]+)" class="footnote-backref">↩︎/g, 'href="#fnref-$1" class="footnote-backref">↩');
	// Also handle without class order variance
	html = html.replace(/>↩︎</g, '>↩<');

	// Ensure hr inside footnotes is self-closing as in original
	html = html.replace('<div class="footnotes"><hr>', '<div class="footnotes"><hr/>');

	// Add rel="nofollow" to external links to match mdsvex output 1:1
	// Main's built HTML has <a href="https://..." rel="nofollow"> for all external links in markdown
	// Use negative lookahead to avoid double-adding if rel already present
	html = html.replace(/<a href="https?:\/\/[^"]+"(?![^>]*\brel=)/g, (a) => `${a} rel="nofollow"`);

	// Remove extra whitespace between footnote content and backref to match main 1:1
	// Main: <a href="...">...</a><a href="#fnref-1" class="footnote-backref">↩</a> (no space, margin provides gap)
	// markdown-it: <a href="...">...</a> <a href="#fnref-1"...> (with space) -> extra gap
	html = html.replace(/<div class="footnotes">([\s\S]*?)<\/div>/g, (match, inner) => {
		const fixed = inner.replace(/\s+<a href="#fnref-/g, '<a href="#fnref-');
		return `<div class="footnotes">${fixed}</div>`;
	});

	return html;
}

export function stripFrontmatter(mdContent: string): string {
	return mdContent.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
}

export function parseFrontmatter(mdContent: string): Record<string, string> {
	const match = mdContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
	if (!match) return {};
	const fm = match[1]!;
	const result: Record<string, string> = {};
	for (const line of fm.split('\n')) {
		const m = line.match(/^(\w+):\s*['"]?([^'"]+)['"]?\s*$/);
		if (m) result[m[1]!] = m[2]!.trim();
		// Handle quoted multiline or simple
		const m2 = line.match(/^(\w+):\s*'(.*)'\s*$/);
		if (m2) result[m2[1]!] = m2[2]!.trim();
	}
	// More robust: handle title with quotes
	const titleMatch = fm.match(/^title:\s*['"]([^'"]+)['"]/m);
	if (titleMatch) result['title'] = titleMatch[1]!.trim();
	const longTitleMatch = fm.match(/^longTitle:\s*['"]([^'"]+)['"]/m);
	if (longTitleMatch) result['longTitle'] = longTitleMatch[1]!.trim();
	const dateMatch = fm.match(/^date:\s*['"]?([^'"\n]+)['"]?/m);
	if (dateMatch) result['date'] = dateMatch[1]!.trim();
	const snippetMatch = fm.match(/^snippet:\s*['"]([^'"]+)['"]/m);
	if (snippetMatch) result['snippet'] = snippetMatch[1]!.trim();
	const descMatch = fm.match(/^description:\s*['"]([^'"]+)['"]/m);
	if (descMatch) result['description'] = descMatch[1]!.trim();
	const githubMatch = fm.match(/^github:\s*['"]([^'"]+)['"]/m);
	if (githubMatch) result['github'] = githubMatch[1]!.trim();

	return result;
}

export function getLastCommitDateSync(_github: string): string | null {
	// Last commit is fetched client-side via vanilla JS (see utils.ts:getLastCommitDate)
	return null;
}

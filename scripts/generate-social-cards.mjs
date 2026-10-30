// @ts-nocheck -- This standalone Node script reads content frontmatter dynamically.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parse } from 'yaml';
import { SITE_DOMAIN } from '../site.config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'static/social');
const width = 1200;
const height = 630;

async function readCollection(name) {
	const directory = path.join(root, 'src/content', name);
	const files = (await readdir(directory)).filter((file) => /\.(md|mdx)$/.test(file));
	return Promise.all(
		files.map(async (file) => {
			const source = await readFile(path.join(directory, file), 'utf8');
			const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? '';
			return {
				id: file.replace(/\.(md|mdx)$/, ''),
				data: parse(frontmatter) ?? {}
			};
		})
	);
}

function wrap(text, maxChars, maxLines) {
	const lines = [];
	let line = '';
	for (const word of text.split(/\s+/)) {
		const next = line ? `${line} ${word}` : word;
		if (next.length > maxChars && line) {
			lines.push(line);
			line = word;
		} else {
			line = next;
		}
	}
	if (line) lines.push(line);
	if (lines.length <= maxLines) return lines;
	const clipped = lines.slice(0, maxLines).join(' ').slice(0, maxLines * maxChars - 2).trimEnd();
	return wrap(`${clipped}…`, maxChars, maxLines);
}

function escapeXml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderSvg(title, description = '') {
	const titleSize = title.length > 90 ? 48 : title.length > 52 ? 60 : 76;
	const titleLines = wrap(title, Math.floor(950 / (titleSize * 0.52)), 3);
	const descriptionLines = wrap(description, 64, 2);
	const titleLineHeight = Math.round(titleSize * 1.2);
	const titleTop = Math.max(240, Math.round((height - titleLines.length * titleLineHeight) / 2) + 30);
	const descriptionTop = height - 76 - descriptionLines.length * 40;
	const text = (lines, x, y, lineHeight, size, family, fill) =>
		lines
			.map(
				(line, index) =>
				`<text x="${x}" y="${y + index * lineHeight}" font-family="${family}" font-size="${size}" fill="${fill}">${escapeXml(line)}</text>`
			)
			.join('\n');

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
		<rect width="${width}" height="${height}" fill="#fafaf9"/>
		<rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="rgba(16,16,16,.14)"/>
		<text x="88" y="118" font-family="Arial, sans-serif" font-size="21" font-weight="600" letter-spacing="5" fill="rgba(16,16,16,.55)">${escapeXml(SITE_DOMAIN.toUpperCase())}</text>
		${text(titleLines, 88, titleTop, titleLineHeight, titleSize, "Georgia, 'Times New Roman', serif", '#101010')}
		${text(descriptionLines, 88, descriptionTop + 28, 40, 26, "Arial, sans-serif", 'rgba(16,16,16,.62)')}
	</svg>`;
}

const writings = await readCollection('writings');
const projects = await readCollection('projects');
const cards = [
	...writings.map(({ id, data }) => ({
		path: `writing/${id}.webp`,
		title: data.longTitle ?? data.title,
		description: data.snippet ?? ''
	})),
	...projects.map(({ id, data }) => ({
		path: `project/${id}.webp`,
		title: data.title,
		description: data.description ?? ''
	}))
];

await rm(outputDir, { recursive: true, force: true });
await Promise.all(
	cards.map(async ({ path: relativePath, title, description }) => {
		const destination = path.join(outputDir, relativePath);
		await mkdir(path.dirname(destination), { recursive: true });
		const image = await sharp(Buffer.from(renderSvg(title, description))).webp({ quality: 90 }).toBuffer();
		await writeFile(destination, image);
	})
);

console.log(`Generated ${cards.length} writing and project social cards in static/social/`);

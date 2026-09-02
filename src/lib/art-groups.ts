import { artData } from './art-data';

export const artGroupNames = ['Dutch Golden Age', 'Traditional & Romantic', 'The Hague School', 'Modern & Symbolist', 'Japanese Woodblock Prints'];
export const artGroupSlug = (name: string) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const artGroupThumbnailIds: Record<string, string> = {
	'Dutch Golden Age': 'the-little-street',
	'Traditional & Romantic': 'mountain-landscape-in-tirol-with-chamois',
	'The Hague School': 'portrait-of-a-wounded-knil-soldier',
	'Modern & Symbolist': 'arbeiterstadt',
	'Japanese Woodblock Prints': 'het-drijvende-paviljoen-te-katada-in-de-sneeuw'
};
export const artThumbnail = (url: string) =>
	url.includes('wikimedia.org')
		? url
		: url.replace(/\/(\d+),\/0\/default\.webp$/, (_, width) =>
			Number(width) > 600 ? '/400,/0/default.webp' : `/${width},/0/default.webp`,
		);

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const hague = ['Mauve', 'Israels', 'Breitner', 'Apol', 'Gabriel', 'Witsen'].map(normalize);
const traditional = ['Friedrich', 'Tavenraat', 'Schwartze'].map(normalize);
const modern = ['Baluschek', 'Russell'].map(normalize);
const japanese = ['Hasui', 'Koson', 'Kawase', 'Kiyochika', 'Koitsu', 'Kako', 'Watanabe', 'Kasamatsu'].map(normalize);

export function getArtGroup(title: string, data: [string, string][]) {
	const artists = data.filter(([key]) => key === 'artist').map(([, value]) => normalize(value)).join(' ');
	const medium = normalize(data.find(([key]) => key === 'medium')?.[1] ?? '');
	if (japanese.some((name) => artists.includes(name)) || medium.includes('woodblock')) {
		return 'Japanese Woodblock Prints';
	}
	const normalizedArtist = artists;
	if (hague.some((name) => normalizedArtist.includes(name))) return 'The Hague School';
	if (traditional.some((name) => normalizedArtist.includes(name))) return 'Traditional & Romantic';
	if (modern.some((name) => normalizedArtist.includes(name))) return 'Modern & Symbolist';
	return title ? 'Dutch Golden Age' : artGroupNames[0];
}

export function getArtGroups() {
	return artGroupNames.map((name) => ({
		name,
		entries: Object.entries(artData).filter(([, artwork]) => getArtGroup(artwork.title, artwork.data as [string, string][]) === name),
	})).filter((group) => group.entries.length > 0);
}

type ArtEntry = (typeof artData)[keyof typeof artData];

export function getArtGroupThumbnail(name: string, entries: [string, ArtEntry][]) {
	const preferredId = artGroupThumbnailIds[name];
	return entries.find(([id]) => id === preferredId)?.[1].thumbnail ?? entries[0]?.[1].thumbnail ?? '';
}

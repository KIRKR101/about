import { artData } from './art-data';

export const artGroupNames = ['Dutch Golden Age', 'Traditional & Romantic', 'The Hague School', 'Modern & Symbolist', 'Japanese Woodblock Prints'];
export const artGroupSlug = (name: string) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const hague = ['Mauve', 'Israels', 'Breitner', 'Apol', 'Gabriel', 'Witsen'].map(normalize);
const traditional = ['Friedrich', 'Tavenraat', 'Schwartze'];
const modern = ['Baluschek', 'Russell'];
const japanese = ['Hasui', 'Koson', 'Kawase'];

export function getArtGroup(title: string, data: [string, string][]) {
	const artist = data.find(([key]) => key === 'artist')?.[1] ?? '';
	if (japanese.some((name) => artist.includes(name))) return 'Japanese Woodblock Prints';
	const normalizedArtist = normalize(artist);
	if (hague.some((name) => normalizedArtist.includes(name))) return 'The Hague School';
	if (traditional.some((name) => artist.includes(name))) return 'Traditional & Romantic';
	if (modern.some((name) => artist.includes(name))) return 'Modern & Symbolist';
	return title ? 'Dutch Golden Age' : artGroupNames[0];
}

export function getArtGroups() {
	return artGroupNames.map((name) => ({
		name,
		entries: Object.entries(artData).filter(([, artwork]) => getArtGroup(artwork.title, artwork.data as [string, string][]) === name),
	})).filter((group) => group.entries.length > 0);
}

import { artData } from './art-data';

export const artGroupNames = [
	'Dutch Golden Age',
	'Neoclassical & Academic',
	'Romantic Landscape',
	'The Hague School',
	'Realism & Barbizon',
	'Impressionism & Post-Impressionism',
	'Modern & Symbolist',
	'Japanese Woodblock Prints'
] as const;

export type ArtGroup = (typeof artGroupNames)[number];

export const artGroupSlug = (name: string) =>
	name
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const artGroupThumbnailIds: Record<ArtGroup, string> = {
	'Dutch Golden Age': 'the-little-street',
	'Neoclassical & Academic': 'met-438640-mountainous-landscape-at-vicovaro',
	'Romantic Landscape': 'met-435857-landscape-with-a-cave',
	'The Hague School': 'bosrand-aan-het-water',
	'Realism & Barbizon': 'met-437847-road-in-the-woods',
	'Impressionism & Post-Impressionism':
		'met-437299-jalais-hill-pontoise',
	'Modern & Symbolist': 'arbeiterstadt',
	'Japanese Woodblock Prints': 'het-drijvende-paviljoen-te-katada-in-de-sneeuw'
};

export const artThumbnail = (url: string) =>
	url.includes('wikimedia.org')
		? url
		: url.replace(/\/(\d+),\/0\/default\.webp$/, (_, width) =>
			Number(width) > 600 ? '/400,/0/default.webp' : `/${width},/0/default.webp`
		);

const normalize = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

const japanese = [
	'Hasui',
	'Koson',
	'Kawase',
	'Kiyochika',
	'Koitsu',
	'Kako',
	'Watanabe',
	'Kasamatsu'
].map(normalize);

const dutchGoldenAge = [
	'Rembrandt',
	'Frans Hals',
	'Vermeer',
	'Pieter de Hooch',
	'Jan Davidsz',
	'Jan Asselijn',
	'Philips Wouwerman',
	'Fabritius',
	'Van Ruisdael',
	'Werner van den Valckert'
].map(normalize);

const neoclassicalAndAcademic = [
	'Jan Ekels II',
	'Johannes Christiaan Janson',
	'Johannes Jelgerhuis',
	'Thérèse Schwartze',
	'Louis Patru',
	'Charles Rémond',
	'François Marius Granet',
	'Hubert Robert',
	'Thomas Gainsborough',
	'John Singleton Copley',
	'Christoffer Wilhelm Eckersberg',
	'Constantin Hansen',
	'Adam August Müller',
	'Adrien Dauzats',
	'Pierre Henri de Valenciennes',
	'Simon Denis',
	'Joseph Bidauld',
	'Jean Alaux',
	'Briton Riviere'
].map(normalize);

const romanticLandscape = [
	'Caspar David Friedrich',
	'Johannes Tavenraat',
	'Alexandre Calame',
	'Carl Gustav Carus',
	'Carl Rottmann',
	'Edward Lear',
	'Johan Christian Dahl',
	"Théodore Caruelle d'Aligny",
	'Henri-Joseph Harpignies',
	'Edouard Bertin'
].map(normalize);

const hagueSchool = [
	'Mauve',
	'Israels',
	'Breitner',
	'Apol',
	'Gabriel',
	'Witsen',
	'Johan Barthold Jongkind',
	'Jacob Maris',
	'Nicolaas van der Waay',
	'Frits Thaulow'
].map(normalize);

const realismAndBarbizon = [
	'Jules Dupré',
	'Constant Troyon',
	'Léon-Germain Pelouse',
	'Jean-François Millet',
	'Gustave Courbet',
	'Camille Corot',
	'Charles-François Daubigny',
	'Théodore Rousseau',
	'British Painter',
	'John Brett'
].map(normalize);

const impressionism = [
	'Alfred Sisley',
	'Edouard Manet',
	'Giuseppe Abbati',
	'Gustave Caillebotte',
	'Eugène Boudin',
	'Camille Pissarro',
	'Claude Monet',
	'Georges Seurat'
].map(normalize);

const modernAndSymbolist = [
	'Odilon Redon',
	'Charles Marion Russell',
	'Hans Baluschek',
	'Edmond-François Aman-Jean',
	'Arnold Böcklin',
	'Vilhelm Hammershøi',
	'Arkhyp Kuindzhi',
	'Fantin-Latour'
].map(normalize);

const matchesArtist = (artists: string, names: string[]) =>
	names.some((name) => artists.includes(name));

export function getArtGroup(title: string, data: [string, string][]): ArtGroup {
	const artists = data
		.filter(([key]) => key === 'artist')
		.map(([, value]) => normalize(value))
		.join(' ');
	const medium = normalize(data.find(([key]) => key === 'medium')?.[1] ?? '');

	if (japanese.some((name) => artists.includes(name)) || medium.includes('woodblock')) {
		return 'Japanese Woodblock Prints';
	}
	if (matchesArtist(artists, dutchGoldenAge)) return 'Dutch Golden Age';
	if (matchesArtist(artists, hagueSchool)) return 'The Hague School';
	if (matchesArtist(artists, impressionism)) return 'Impressionism & Post-Impressionism';
	if (matchesArtist(artists, modernAndSymbolist)) return 'Modern & Symbolist';
	if (matchesArtist(artists, realismAndBarbizon)) return 'Realism & Barbizon';
	if (matchesArtist(artists, neoclassicalAndAcademic)) return 'Neoclassical & Academic';
	if (matchesArtist(artists, romanticLandscape)) return 'Romantic Landscape';

	// Preserve the original fallback for entries whose artist is not listed above.
	return title ? 'Dutch Golden Age' : artGroupNames[0];
}

export function getArtGroups() {
	return artGroupNames
		.map((name) => ({
			name,
			entries: Object.entries(artData).filter(
				([, artwork]) =>
					getArtGroup(artwork.title, artwork.data as [string, string][]) === name
			)
		}))
		.filter((group) => group.entries.length > 0);
}

type ArtEntry = (typeof artData)[keyof typeof artData];

export function getArtGroupThumbnail(name: string, entries: [string, ArtEntry][]) {
	const preferredId = artGroupThumbnailIds[name as ArtGroup];
	return (
		entries.find(([id]) => id === preferredId)?.[1].thumbnail ??
		entries[0]?.[1].thumbnail ??
		''
	);
}

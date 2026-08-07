const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit',
	month: 'short',
	year: 'numeric'
});
const shortDateFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short', day: '2-digit' });

export function formatDate(dateString: string) {
	return dateFormatter.format(new Date(dateString));
}

export function formatShortDate(dateString: string) {
	return shortDateFormatter.format(new Date(dateString));
}

export function getMetaValue(
	data: Array<[string, string] | string[]>,
	key: string
): string | undefined {
	return data.find(([k]) => k === key)?.[1];
}

export function getContributionColor(count: number) {
	if (count === 0) return '#1a1a1c';
	if (count < 5) return '#0e4429';
	if (count < 10) return '#006d32';
	if (count < 20) return '#26a641';
	return '#39d353';
}

const IIIF_WIDTHS: readonly number[] = [500, 800, 1200, 1600];
const HARDCOVER_WIDTHS: readonly number[] = [150, 270, 400];

export function isIiifUrl(url: string): boolean {
	return /\/\d+,?\/0\/default\.(webp|jpg)$/.test(url);
}

export function getIiifSrcset(url: string): string {
	if (!isIiifUrl(url)) return '';
	return IIIF_WIDTHS.map((w: number) =>
		url.replace(/\/\d+,?\/0\/default/, `/${w},/0/default`)
	).join(', ');
}

export function getHardcoverSrcset(coverUrl: string): string {
	if (!coverUrl) return '';
	const base = 'https://production-img.hardcover.app/enlarge';
	return HARDCOVER_WIDTHS.map((w) => {
		const h = Math.round(w * 1.5);
		const params = new URLSearchParams({
			width: String(w),
			height: String(h),
			type: 'webp',
			url: coverUrl
		});
		return `${base}?${params} ${w}w`;
	}).join(', ');
}

export async function getLastCommitDate(repoUrl: string): Promise<string | null> {
	try {
		const res = await fetch('https://github.kirkr.xyz/api/last-commit');
		if (!res.ok) return null;

		const data: {
			repositories: { name: string; url: string; lastCommitDate: string | null }[] | null;
		} = await res.json();

		if (!data.repositories) return null;

		const normalise = (url: string) =>
			url
				.replace(/^https?:\/\//, '')
				.replace(/\/+$/, '')
				.replace(/\.git$/, '')
				.toLowerCase();
		const target = normalise(repoUrl);

		const repo = data.repositories.find((r) => normalise(r.url) === target);

		return repo?.lastCommitDate ?? null;
	} catch {
		return null;
	}
}

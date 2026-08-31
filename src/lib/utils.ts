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
	if (count === 0) return 'var(--contribution-0)';
	if (count < 2) return 'var(--contribution-1)';
	if (count < 4) return 'var(--contribution-2)';
	if (count < 6) return 'var(--contribution-3)';
	if (count < 8) return 'var(--contribution-4)';
	if (count < 10) return 'var(--contribution-5)';
	if (count < 12) return 'var(--contribution-6)';
	return 'var(--contribution-7)';
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

interface LastCommitRepo {
	name: string;
	url: string;
	lastCommitDate: string | null;
}

const LAST_COMMIT_CACHE_KEY = 'gh-last-commit-cache';
const LAST_COMMIT_CACHE_TTL = 12 * 60 * 60 * 1000;

function loadCachedRepos(): LastCommitRepo[] | null {
	if (typeof window === 'undefined') return null;
	try {
		const stored = localStorage.getItem(LAST_COMMIT_CACHE_KEY);
		if (!stored) return null;
		const parsed = JSON.parse(stored);
		if (parsed && Array.isArray(parsed.repositories) && typeof parsed.timestamp === 'number') {
			if (Date.now() - parsed.timestamp > LAST_COMMIT_CACHE_TTL) {
				localStorage.removeItem(LAST_COMMIT_CACHE_KEY);
				return null;
			}
			return parsed.repositories;
		}
		return null;
	} catch {
		return null;
	}
}

function saveCachedRepos(repositories: LastCommitRepo[]) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(
			LAST_COMMIT_CACHE_KEY,
			JSON.stringify({ repositories, timestamp: Date.now() })
		);
	} catch {
		// localStorage not available
	}
}

function findRepo(repositories: LastCommitRepo[], repoUrl: string) {
	const normalise = (url: string) =>
		url
			.replace(/^https?:\/\//, '')
			.replace(/\/+$/, '')
			.replace(/\.git$/, '')
			.toLowerCase();
	const target = normalise(repoUrl);
	const repo = repositories.find((r) => normalise(r.url) === target);
	return repo?.lastCommitDate ?? null;
}

export async function getLastCommitDate(repoUrl: string): Promise<string | null> {
	const cached = loadCachedRepos();
	if (cached) return findRepo(cached, repoUrl);

	try {
		const res = await fetch('https://github.kirkr.xyz/api/last-commit');
		if (!res.ok) return null;

		const data: { repositories: LastCommitRepo[] | null } = await res.json();
		if (!data.repositories) return null;

		saveCachedRepos(data.repositories);
		return findRepo(data.repositories, repoUrl);
	} catch {
		return null;
	}
}

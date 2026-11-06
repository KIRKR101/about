import type { APIRoute } from 'astro';
import { LASTFM_API_URL, SITE_URL, SPOTIFY_API_URL } from '../../lib/site';

// Same-origin now-playing feed.
//
// The Spotify proxy only allows a fixed set of browser origins, so calling it
// directly from the page breaks whenever the site is served from another
// domain. Fetching it here keeps the browser request same-origin and lets the
// Last.fm fallback happen server-side. The response stays uncached because a
// stale song is worse than another small upstream request.
export const prerender = false;

type SpotifyImage = { url?: string; width?: number };
type SpotifyTrack = {
	title?: string;
	artist?: string;
	album?: string;
	songUrl?: string;
	externalUrl?: string;
	trackUrl?: string;
	artistUrl?: string;
	isPlaying?: boolean;
	duration?: number;
	progress?: number;
	images?: SpotifyImage[];
};

type LastFmImageSize = 'small' | 'medium' | 'large' | 'extralarge' | 'mega';
type LastFmTrack = {
	status?: string;
	title?: string;
	artist?: string;
	album?: string;
	songUrl?: string;
	externalUrl?: string;
	trackUrl?: string;
	artistUrl?: string;
	isPlaying?: boolean;
	images?: Partial<Record<LastFmImageSize, string>>;
};

type TrackImage = { url: string; width: number };
export type NowPlaying = {
	source: 'spotify' | 'lastfm';
	title: string;
	artist: string;
	album: string | null;
	url: string | null;
	artistUrl: string | null;
	isPlaying: boolean;
	duration: number | null;
	progress: number | null;
	images: TrackImage[];
	next_poll_ms?: number;
	stale?: boolean;
};

const SAMPLE_KEY = `${SITE_URL}/__cache/now-playing-sample`;
const LAST_KEY = `${SITE_URL}/__cache/now-playing-last`;

function ttlFor(track: NowPlaying): number {
	if (!track.title) return 30;
	if (!track.isPlaying) return 60;
	if (track.duration === null || track.progress === null) return 5;
	const remaining = (track.duration - track.progress) / 1000;
	return remaining < 2 ? 0 : Math.min(Math.floor(remaining), 15);
}

function cacheEntry(track: NowPlaying, ttl: number) {
	return new Response(JSON.stringify({ ...track, sampled_at: Date.now() }), {
		headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttl}` }
	});
}

const LASTFM_WIDTHS: Record<LastFmImageSize, number> = {
	small: 34,
	medium: 64,
	large: 174,
	extralarge: 300,
	mega: 500
};

const fetchJson = async <T>(url: string): Promise<T> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);
	try {
		const response = await fetch(url, { signal: controller.signal });
		if (!response.ok) throw new Error(`${url} responded ${response.status}`);
		return (await response.json()) as T;
	} finally {
		clearTimeout(timeout);
	}
};

const spotifyImages = (images: SpotifyImage[] = []): TrackImage[] =>
	images
		.filter(
			(image): image is { url: string; width: number } =>
				typeof image.url === 'string' && typeof image.width === 'number'
		)
		.sort((a, b) => a.width - b.width)
		.map(({ url, width }) => ({ url, width }));

const lastFmImages = (images: Partial<Record<LastFmImageSize, string>> = {}): TrackImage[] =>
	(Object.keys(LASTFM_WIDTHS) as LastFmImageSize[]).flatMap((size) => {
		const url = images[size];
		return url ? [{ url, width: LASTFM_WIDTHS[size] }] : [];
	});

const firstUrl = (...urls: (string | undefined)[]) => urls.find(Boolean) ?? null;

const validTrack = (track: { title?: unknown; artist?: unknown }) =>
	typeof track.title === 'string' &&
	track.title.trim().length > 0 &&
	typeof track.artist === 'string' &&
	track.artist.trim().length > 0;

const fromSpotify = (track: SpotifyTrack): NowPlaying => ({
	source: 'spotify',
	title: track.title || 'Unknown track',
	artist: track.artist || 'Unknown artist',
	album: track.album || null,
	url: firstUrl(track.songUrl, track.externalUrl, track.trackUrl),
	artistUrl: track.artistUrl ?? null,
	isPlaying: track.isPlaying === true,
	duration: typeof track.duration === 'number' ? track.duration : null,
	progress: typeof track.progress === 'number' ? track.progress : null,
	images: spotifyImages(track.images)
});

const fromLastFm = (track: LastFmTrack): NowPlaying => ({
	source: 'lastfm',
	title: track.title || 'Unknown track',
	artist: track.artist || 'Unknown artist',
	album: track.album || null,
	url: firstUrl(track.trackUrl, track.songUrl, track.externalUrl),
	artistUrl: track.artistUrl ?? null,
	isPlaying: track.isPlaying === true || /currently playing/i.test(track.status ?? ''),
	duration: null,
	progress: null,
	images: lastFmImages(track.images)
});

const json = (body: unknown, status = 200, cache = 'no-store') =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': cache,
			'Cloudflare-CDN-Cache-Control': cache
		}
	});

async function sampleUpstream(): Promise<NowPlaying> {
	try {
		const track = await fetchJson<SpotifyTrack>(SPOTIFY_API_URL);
		if (typeof track.isPlaying !== 'boolean' || !validTrack(track))
			throw new Error('Invalid Spotify response');
		return fromSpotify(track);
	} catch {
		const track = await fetchJson<LastFmTrack>(LASTFM_API_URL);
		if (!validTrack(track)) throw new Error('Invalid Last.fm response');
		return fromLastFm(track);
	}
}

export const GET: APIRoute = async ({ cache }) => {
	// This endpoint maintains its own short-lived upstream sample cache below.
	// Do not also cache the HTTP response under the catch-all route rule.
	cache.set(false);
	const sampleCache = (caches as CacheStorage & { default: Cache }).default;
	let sample: (NowPlaying & { sampled_at: number }) | undefined;
	let stale = false;
	let cacheAvailable = true;
	try {
		const hit = await sampleCache.match(SAMPLE_KEY);
		if (hit) sample = await hit.json();
	} catch {
		cacheAvailable = false;
	}
	if (!sample) {
		try {
			const track = await sampleUpstream();
			sample = { ...track, sampled_at: Date.now() };
			if (cacheAvailable) {
				const ttl = ttlFor(track);
				try {
					if (ttl > 0) await sampleCache.put(SAMPLE_KEY, cacheEntry(track, ttl));
					await sampleCache.put(LAST_KEY, cacheEntry(track, 600));
				} catch {
					// Cache writes are best-effort; keep serving the fresh upstream sample.
				}
			}
		} catch {
			try {
				const last = await sampleCache.match(LAST_KEY);
				if (last) {
					sample = await last.json();
					stale = true;
				}
			} catch {
				// The upstream and cache are both unavailable.
			}
		}
	}
	if (!sample) return json({ error: 'unavailable' }, 503);
	const age = Date.now() - sample.sampled_at;
	const progress =
		sample.isPlaying && sample.progress !== null && sample.duration !== null
			? Math.min(sample.progress + age, sample.duration)
			: sample.progress;
	const expiredStaleTrack =
		stale && sample.duration !== null && progress !== null && progress >= sample.duration;
	return json({
		...sample,
		isPlaying: expiredStaleTrack ? false : sample.isPlaying,
		progress,
		next_poll_ms: stale
			? 30_000
			: sample.isPlaying && sample.duration !== null && progress !== null
				? Math.max(1000, Math.min(15_000, sample.duration - progress + 400))
				: sample.isPlaying
					? 15_000
					: sample.title
						? 60_000
						: 30_000,
		stale
	});
};

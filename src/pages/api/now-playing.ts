import type { APIRoute } from 'astro';
import { LASTFM_API_URL, SPOTIFY_API_URL } from '../../lib/site';

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
};

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
	typeof track.title === 'string' && track.title.trim().length > 0 &&
	typeof track.artist === 'string' && track.artist.trim().length > 0;

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

const json = (
	body: unknown,
	status = 200,
	cache = 'no-store'
) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': cache,
			'Cloudflare-CDN-Cache-Control': cache
		}
	});

export const GET: APIRoute = async () => {
	try {
		const track = await fetchJson<SpotifyTrack>(SPOTIFY_API_URL);
		if (typeof track.isPlaying !== 'boolean' || !validTrack(track))
			throw new Error('Invalid Spotify response');
		if (track.isPlaying === false && !track.title) throw new Error('Spotify is idle');
		return json(fromSpotify(track));
	} catch {
		try {
			const track = await fetchJson<LastFmTrack>(LASTFM_API_URL);
			if (!validTrack(track)) throw new Error('Invalid Last.fm response');
			return json(fromLastFm(track));
		} catch {
			return json({ error: 'unavailable' }, 503, 'no-store');
		}
	}
};

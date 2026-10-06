// Reusable Spotify and Last.fm now-playing logic, retained for future UI integration.
const SPOTIFY_API_URL = 'https://spotify.kirkr.xyz/api/now-playing';
const LASTFM_API_URL = 'https://lastfm.kirkr.xyz/api/lastfm-track';
let spotifyData: any = null;
let lastFmData: any = null;
let dataSource: 'spotify' | 'lastfm' | null = null;
let localProgress = 0;
let lastFetchTime = 0;
let isFetching = false;
let pollId: ReturnType<typeof setInterval> | undefined;
let progressId: ReturnType<typeof setInterval> | undefined;
let retryTimeout: ReturnType<typeof setTimeout> | undefined;
let hiddenAt: number | null = null;
let removeVisibility: (() => void) | undefined;

const formatTime = (milliseconds: number) => {
	const seconds = Math.max(0, Math.floor(milliseconds / 1000));
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
const spotifyImageSet = (images: any[] = []) =>
	[...images]
		.sort((a, b) => a.width - b.width)
		.map((image) => `${image.url} ${image.width}w`)
		.join(', ');
const spotifyImage = (images: any[] = []) => {
	const sorted = [...images].sort((a, b) => a.width - b.width);
	return sorted.find((image) => image.width >= 128)?.url ?? sorted[0]?.url ?? '';
};
const lastFmImageSet = (images: Record<string, string> = {}) => {
	const widths: Record<string, string> = {
		small: '34w',
		medium: '64w',
		large: '174w',
		extralarge: '300w',
		mega: '500w'
	};
	return Object.entries(images)
		.filter(([size, url]) => url && widths[size])
		.map(([size, url]) => `${url} ${widths[size]}`)
		.join(', ');
};
const setExternalContent = (element: Element, text: string, href?: string) => {
	element.textContent = '';
	if (!href) {
		element.textContent = text;
		return;
	}
	const link = document.createElement('a');
	link.href = href;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.className = 'text-inherit no-underline transition-colors hover:text-ink-70';
	link.textContent = text;
	element.append(link);
};

const queryEls = () => ({
	status: document.querySelector('[data-track-status]'),
	image: document.querySelector('[data-track-image]') as HTMLImageElement | null,
	title: document.querySelector('[data-track-title]'),
	artist: document.querySelector('[data-track-artist]'),
	wrap: document.querySelector('[data-track-progress-wrap]'),
	bar: document.querySelector('[data-track-progress-bar]') as HTMLElement | null,
	current: document.querySelector('[data-track-progress-current]'),
	total: document.querySelector('[data-track-progress-total]')
});

let els = queryEls();

function updateTrack() {
	const { status, image, title, artist, wrap, bar, current, total } = els;
	const track =
		dataSource === 'spotify' ? spotifyData : dataSource === 'lastfm' ? lastFmData : null;
	if (!status || !title || !artist || !image) return;
	if (!track) {
		status.textContent = 'Listening';
		title.textContent = 'Nothing playing';
		artist.textContent = 'Music unavailable';
		image.classList.add('hidden');
		wrap?.classList.add('hidden');
		wrap?.classList.remove('flex');
		return;
	}
	const spotify = dataSource === 'spotify';
	status.textContent = spotify && track.isPlaying ? 'Now playing' : 'Last listen';
	setExternalContent(
		title,
		track.title || 'Unknown track',
		track.songUrl || track.externalUrl || track.trackUrl
	);
	setExternalContent(
		artist,
		[track.artist, track.album].filter(Boolean).join(' · ') || '—',
		track.artistUrl
	);
	const imageUrl = spotify
		? spotifyImage(track.images)
		: (track.images?.medium ??
			track.images?.small ??
			track.images?.large ??
			track.images?.extralarge ??
			'');
	if (imageUrl) {
		image.src = imageUrl;
		image.alt = track.title || '';
		image.classList.remove('hidden');
		if (spotify && track.images?.length) {
			image.srcset = spotifyImageSet(track.images);
			image.sizes = '128px';
		} else if (!spotify && track.images) {
			image.srcset = lastFmImageSet(track.images);
			image.sizes = '128px';
		} else {
			image.removeAttribute('srcset');
			image.removeAttribute('sizes');
		}
	}
	if (spotify && track.isPlaying && track.duration > 0) {
		wrap?.classList.remove('hidden');
		wrap?.classList.add('flex');
		const percent = Math.min(100, (localProgress / track.duration) * 100);
		if (bar) bar.style.width = `${percent}%`;
		if (current) current.textContent = formatTime(localProgress);
		if (total) total.textContent = formatTime(track.duration);
	} else {
		wrap?.classList.add('hidden');
		wrap?.classList.remove('flex');
	}
}

function tickProgress() {
	if (!spotifyData?.isPlaying || !(spotifyData.duration > 0)) return;
	localProgress = Math.min(
		spotifyData.duration ?? 0,
		(spotifyData.progress ?? 0) + Date.now() - lastFetchTime
	);
	const percent = Math.min(100, (localProgress / spotifyData.duration) * 100);
	if (els.bar) els.bar.style.width = `${percent}%`;
	if (els.current) els.current.textContent = formatTime(localProgress);
	if (localProgress >= (spotifyData.duration ?? 0)) {
		stopProgress();
		if (retryTimeout === undefined) retryTimeout = setTimeout(fetchCurrentTrack, 500);
	}
}

function stopProgress() {
	if (progressId !== undefined) clearInterval(progressId);
	progressId = undefined;
}
function startProgress() {
	stopProgress();
	if (!spotifyData?.isPlaying || !(spotifyData.duration > 0)) return;
	tickProgress();
	progressId = setInterval(tickProgress, 1000);
}

async function fetchSpotifyTrack() {
	if (isFetching) return;
	isFetching = true;
	try {
		const response = await fetch(SPOTIFY_API_URL);
		if (!response.ok) throw new Error(`Spotify ${response.status}`);
		const data = await response.json();
		if (data.isPlaying === false && !data.title) {
			retryTimeout = setTimeout(fetchSpotifyTrack, 30_000);
			return;
		}
		if (data.isPlaying === undefined) throw new Error('Invalid Spotify response');
		if (retryTimeout !== undefined) {
			clearTimeout(retryTimeout);
			retryTimeout = undefined;
		}
		spotifyData = data;
		localProgress = data.progress ?? 0;
		lastFetchTime = Date.now();
		dataSource = 'spotify';
		updateTrack();
		startProgress();
	} catch {
		try {
			const response = await fetch(LASTFM_API_URL);
			if (!response.ok) throw new Error(`Last.fm ${response.status}`);
			lastFmData = await response.json();
			dataSource = 'lastfm';
		} catch {
			dataSource = null;
		}
		stopProgress();
		updateTrack();
	} finally {
		isFetching = false;
	}
}

async function fetchLastFmTrack() {
	try {
		const response = await fetch(LASTFM_API_URL);
		if (!response.ok) throw new Error(`Last.fm ${response.status}`);
		lastFmData = await response.json();
		dataSource = 'lastfm';
		updateTrack();
	} catch {
		dataSource = null;
		updateTrack();
	}
}
function fetchCurrentTrack() {
	if (dataSource === 'lastfm') fetchLastFmTrack();
	else fetchSpotifyTrack();
}
function startPolling() {
	if (pollId === undefined) pollId = setInterval(fetchCurrentTrack, 30_000);
}
function stopPolling() {
	if (pollId !== undefined) clearInterval(pollId);
	pollId = undefined;
}
function stopRetry() {
	if (retryTimeout !== undefined) clearTimeout(retryTimeout);
	retryTimeout = undefined;
}
function initTrackPolling() {
	els = queryEls();
	stopPolling();
	stopProgress();
	removeVisibility?.();
	const onVisibility = () => {
		if (document.hidden) {
			hiddenAt = Date.now();
			stopPolling();
			stopProgress();
			stopRetry();
		} else {
			const wasHidden = hiddenAt ? Date.now() - hiddenAt : 0;
			hiddenAt = null;
			if (wasHidden > 30_000) fetchCurrentTrack();
			startPolling();
			startProgress();
		}
	};
	document.addEventListener('visibilitychange', onVisibility);
	removeVisibility = () => document.removeEventListener('visibilitychange', onVisibility);
	fetchCurrentTrack();
	if (!document.hidden) startPolling();
}
initTrackPolling();
document.addEventListener('astro:before-swap', () => {
	stopPolling();
	stopProgress();
	stopRetry();
	removeVisibility?.();
});
document.addEventListener('astro:after-swap', () => {
	initTrackPolling();
});

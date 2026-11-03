// Now-playing widget for src/components/NowPlaying.astro.
//
// Data comes from the same-origin /api/now-playing route, which talks to the
// Spotify proxy and falls back to Last.fm server-side. Polling and the progress
// ticker pause while the tab is hidden.
type TrackImage = { url: string; width: number };
type NowPlaying = {
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

type Elements = {
	root: HTMLElement;
	status: Element | null;
	cover: HTMLAnchorElement | null;
	image: HTMLImageElement | null;
	placeholder: Element | null;
	title: Element | null;
	artist: Element | null;
	progress: HTMLElement | null;
	wrap: HTMLElement | null;
	bar: HTMLElement | null;
	current: Element | null;
	total: Element | null;
};

const POLL_INTERVAL = 30_000;
const LINK_CLASS =
	'underline decoration-transparent underline-offset-2 transition-[text-decoration-color] duration-100 hover:decoration-current';

let currentTrack: NowPlaying | null = null;
let localProgress = 0;
let lastFetchTime = 0;
let isFetching = false;
let pollId: ReturnType<typeof setInterval> | undefined;
let progressId: ReturnType<typeof setInterval> | undefined;
let retryTimeout: ReturnType<typeof setTimeout> | undefined;
let hiddenAt: number | null = null;
let removeVisibility: (() => void) | undefined;
let els: Elements | null = null;
let renderedKey: string | null = null;
let requestVersion = 0;

const formatTime = (milliseconds: number) => {
	const value = Number.isFinite(milliseconds) ? milliseconds : 0;
	const seconds = Math.max(0, Math.floor(value / 1000));
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const imageSet = (images: TrackImage[]) =>
	[...images]
		.sort((a, b) => a.width - b.width)
		.map((image) => `${image.url} ${image.width}w`)
		.join(', ');

const coverImage = (images: TrackImage[]) => {
	const sorted = [...images].sort((a, b) => a.width - b.width);
	return sorted.find((image) => image.width >= 128)?.url ?? sorted[0]?.url ?? '';
};

const setLink = (element: Element | null, text: string, href?: string) => {
	if (!element) return;
	element.textContent = '';
	if (!href) {
		element.textContent = text;
		return;
	}
	const link = document.createElement('a');
	link.href = href;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.className = LINK_CLASS;
	link.textContent = text;
	element.append(link);
};

const setProgressAria = (element: Element | null, elapsed: number, duration: number) => {
	if (!element) return;
	element.setAttribute('aria-valuemax', String(Math.round(duration / 1000)));
	element.setAttribute('aria-valuenow', String(Math.round(elapsed / 1000)));
	element.setAttribute('aria-valuetext', `${formatTime(elapsed)} of ${formatTime(duration)}`);
};

function queryEls(): Elements | null {
	const root = document.querySelector<HTMLElement>('[data-now-playing]');
	if (!root) return null;
	return {
		root,
		status: root.querySelector('[data-track-status-text]'),
		cover: root.querySelector<HTMLAnchorElement>('[data-track-cover]'),
		image: root.querySelector<HTMLImageElement>('[data-track-image]'),
		placeholder: root.querySelector('[data-track-placeholder]'),
		title: root.querySelector('[data-track-title]'),
		artist: root.querySelector('[data-track-artist]'),
		progress: root.querySelector<HTMLElement>('[data-track-progress]'),
		wrap: root.querySelector<HTMLElement>('[data-track-progress-wrap]'),
		bar: root.querySelector<HTMLElement>('[data-track-progress-bar]'),
		current: root.querySelector('[data-track-progress-current]'),
		total: root.querySelector('[data-track-progress-total]')
	};
}

function paintProgress() {
	const elements = els;
	if (!elements) return;
	const duration = currentTrack?.duration ?? 0;
	const show = Boolean(currentTrack?.isPlaying && duration > 0);
	if (elements.wrap) {
		elements.wrap.classList.toggle('hidden', !show);
		elements.wrap.classList.toggle('flex', show);
	}
	if (!show) return;
	const percent = Math.min(100, (localProgress / duration) * 100);
	if (elements.bar) elements.bar.style.width = `${percent}%`;
	if (elements.current) elements.current.textContent = formatTime(localProgress);
	if (elements.total) elements.total.textContent = formatTime(duration);
	setProgressAria(elements.progress, localProgress, duration);
}

function updateTrack() {
	const elements = els;
	if (!elements) return;
	const { root, status, cover, image, placeholder, title, artist } = elements;

	const track = currentTrack;

	if (!track) {
		root.dataset['state'] = 'idle';
		if (status) status.textContent = 'Connection';
		setLink(title, 'Nothing playing');
		setLink(artist, 'Music unavailable');
		if (cover) {
			cover.removeAttribute('href');
			cover.removeAttribute('aria-label');
			cover.classList.remove('cursor-pointer');
		}
		if (image) {
			image.classList.add('hidden');
			image.removeAttribute('srcset');
			image.removeAttribute('sizes');
		}
		placeholder?.classList.remove('hidden');
		paintProgress();
		return;
	}

	root.dataset['state'] = track.isPlaying ? 'playing' : 'paused';
	if (status) status.textContent = track.isPlaying ? '' : 'Last played';

	setLink(title, track.title, track.url ?? undefined);
	setLink(artist, track.artist, track.artistUrl ?? undefined);
	const imageUrl = coverImage(track.images);
	if (image) {
		if (imageUrl) {
			image.src = imageUrl;
			image.alt = `Cover art for ${track.title} by ${track.artist}`;
			image.classList.remove('hidden');
			placeholder?.classList.add('hidden');
			if (track.images.length > 0) {
				image.srcset = imageSet(track.images);
				image.sizes = '80px';
			} else {
				image.removeAttribute('srcset');
				image.removeAttribute('sizes');
			}
		} else {
			image.classList.add('hidden');
			image.removeAttribute('srcset');
			image.removeAttribute('sizes');
			placeholder?.classList.remove('hidden');
		}
	}

	if (cover) {
		if (track.url) {
			cover.href = track.url;
			cover.target = '_blank';
			cover.rel = 'noopener noreferrer';
			cover.setAttribute(
				'aria-label',
				`Open ${track.title} by ${track.artist} on ${track.source === 'spotify' ? 'Spotify' : 'Last.fm'}`
			);
			cover.classList.add('cursor-pointer');
		} else {
			cover.removeAttribute('href');
			cover.removeAttribute('aria-label');
			cover.classList.remove('cursor-pointer');
		}
	}

	paintProgress();
}

const trackKey = (track: NowPlaying | null) =>
	track
		? [track.source, track.title, track.artist, track.album, track.isPlaying, track.url].join('|')
		: 'idle';

function renderIfChanged() {
	const key = trackKey(currentTrack);
	const bar = els?.bar;
	// Each poll is an authoritative progress correction, even when track identity
	// is unchanged. Snap to that value, then resume the one-second linear updates.
	if (bar) bar.style.transitionProperty = 'none';
	if (key === renderedKey) {
		paintProgress();
	} else {
		renderedKey = key;
		updateTrack();
	}
	if (bar) {
		// Commit the new width while transitions are disabled. Restore the CSS
		// transition on the next frame so subsequent playback ticks stay smooth.
		void bar.offsetWidth;
		requestAnimationFrame(() => {
			bar.style.removeProperty('transition-property');
		});
	}
}

function tickProgress() {
	if (!currentTrack?.isPlaying) return;
	const duration = currentTrack.duration ?? 0;
	if (duration <= 0) return;
	localProgress = Math.min(duration, (currentTrack.progress ?? 0) + Date.now() - lastFetchTime);
	const percent = Math.min(100, (localProgress / duration) * 100);
	const elements = els;
	if (elements?.bar) elements.bar.style.width = `${percent}%`;
	if (elements?.current) elements.current.textContent = formatTime(localProgress);
	setProgressAria(elements?.progress ?? null, localProgress, duration);
	if (localProgress >= duration) {
		stopProgress();
		if (retryTimeout === undefined) {
			retryTimeout = setTimeout(() => {
				retryTimeout = undefined;
				fetchNowPlaying();
			}, 500);
		}
	}
}

function stopProgress() {
	if (progressId !== undefined) clearInterval(progressId);
	progressId = undefined;
}

function startProgress() {
	stopProgress();
	if (!currentTrack?.isPlaying) return;
	if (!((currentTrack.duration ?? 0) > 0)) return;
	tickProgress();
	progressId = setInterval(tickProgress, 1000);
}

async function fetchNowPlaying() {
	if (isFetching) return;
	isFetching = true;
	const version = requestVersion;
	try {
		const response = await fetch('/api/now-playing', { cache: 'no-store' });
		if (!response.ok) throw new Error(`Now playing ${response.status}`);
		const data = (await response.json()) as NowPlaying;
		if (
			!data ||
			(typeof data.source !== 'string' || !['spotify', 'lastfm'].includes(data.source)) ||
			typeof data.title !== 'string' ||
			!data.title.trim() ||
			typeof data.artist !== 'string' ||
			!data.artist.trim() ||
			typeof data.isPlaying !== 'boolean' ||
			!Array.isArray(data.images)
		) {
			throw new Error('Invalid response');
		}
		if (version !== requestVersion) return;
		currentTrack = data;
		localProgress = Number.isFinite(data.progress) ? Math.max(0, data.progress ?? 0) : 0;
		lastFetchTime = Date.now();
		renderIfChanged();
		startProgress();
	} catch {
		// Keep the last known track visible during a transient network or API error.
	} finally {
		isFetching = false;
	}
}

function startPolling() {
	if (pollId === undefined) pollId = setInterval(fetchNowPlaying, POLL_INTERVAL);
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
	requestVersion++;
	stopPolling();
	stopProgress();
	stopRetry();
	removeVisibility?.();
	removeVisibility = undefined;

	els = queryEls();
	if (!els) return;
	renderedKey = null;

	const image = els.image;
	if (image) {
		image.onerror = () => {
			image.classList.add('hidden');
			els?.placeholder?.classList.remove('hidden');
		};
	}

	const onVisibility = () => {
		if (document.hidden) {
			hiddenAt = Date.now();
			stopPolling();
			stopProgress();
			stopRetry();
		} else {
			const wasHidden = hiddenAt ? Date.now() - hiddenAt : 0;
			hiddenAt = null;
			if (wasHidden > POLL_INTERVAL) fetchNowPlaying();
			startPolling();
			startProgress();
		}
	};
	document.addEventListener('visibilitychange', onVisibility);
	removeVisibility = () => document.removeEventListener('visibilitychange', onVisibility);

	fetchNowPlaying();
	if (!document.hidden) startPolling();
}

initTrackPolling();
document.addEventListener('astro:before-swap', () => {
	requestVersion++;
	stopPolling();
	stopProgress();
	stopRetry();
	removeVisibility?.();
	removeVisibility = undefined;
	els = null;
});
document.addEventListener('astro:after-swap', initTrackPolling);

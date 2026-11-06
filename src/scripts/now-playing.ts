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
	next_poll_ms?: number;
	stale?: boolean;
};

type Elements = {
	root: HTMLElement;
	skeleton: HTMLElement | null;
	content: HTMLElement | null;
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
	hoverCover: HTMLImageElement | null;
	hoverTitle: Element | null;
	hoverArtist: Element | null;
	hoverWrap: HTMLElement | null;
	hoverBar: HTMLElement | null;
	hoverCurrent: Element | null;
	hoverTotal: Element | null;
};

const POLL_INTERVAL = 15_000;
const LINK_CLASS =
	'underline decoration-transparent underline-offset-2 transition-[text-decoration-color] duration-100 hover:decoration-current';

let currentTrack: NowPlaying | null = null;
let localProgress = 0;
let progressBase = 0;
let progressAnchor = 0;
let isFetching = false;
let pollId: ReturnType<typeof setTimeout> | undefined;
let progressId: ReturnType<typeof setInterval> | undefined;
let retryTimeout: ReturnType<typeof setTimeout> | undefined;
let hiddenAt: number | null = null;
let removeVisibility: (() => void) | undefined;
let removeWakeListeners: (() => void) | undefined;
let els: Elements | null = null;
let renderedKey: string | null = null;
let requestVersion = 0;
let failures = 0;

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
		skeleton: root.querySelector<HTMLElement>('[data-track-skeleton]'),
		content: root.querySelector<HTMLElement>('[data-track-content]'),
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
		total: root.querySelector('[data-track-progress-total]'),
		hoverCover: root.querySelector<HTMLImageElement>('[data-hover-cover]'),
		hoverTitle: root.querySelector('[data-hover-title]'),
		hoverArtist: root.querySelector('[data-hover-artist]'),
		hoverWrap: root.querySelector<HTMLElement>('[data-hover-progress-wrap]'),
		hoverBar: root.querySelector<HTMLElement>('[data-hover-bar]'),
		hoverCurrent: root.querySelector('[data-hover-current]'),
		hoverTotal: root.querySelector('[data-hover-total]')
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
	if (show) {
		const percent = Math.min(100, (localProgress / duration) * 100);
		if (elements.bar) elements.bar.style.transform = `scaleX(${percent / 100})`;
		if (elements.current) elements.current.textContent = formatTime(localProgress);
		if (elements.total) elements.total.textContent = formatTime(duration);
		setProgressAria(elements.progress, localProgress, duration);
	}
	const hoverDuration = currentTrack?.duration ?? 0;
	const hoverShow = hoverDuration > 0;
	elements.hoverWrap?.classList.toggle('hidden', !hoverShow);
	elements.hoverWrap?.classList.toggle('flex', hoverShow);
	if (hoverShow) {
		const hoverPercent = Math.min(100, (localProgress / hoverDuration) * 100);
		if (elements.hoverBar) elements.hoverBar.style.transform = `scaleX(${hoverPercent / 100})`;
		if (elements.hoverCurrent) elements.hoverCurrent.textContent = formatTime(localProgress);
		if (elements.hoverTotal) elements.hoverTotal.textContent = formatTime(hoverDuration);
	}
}

function updateTrack() {
	const elements = els;
	if (!elements) return;
	const { root, status, cover, image, placeholder, title, artist } = elements;
	elements.skeleton?.classList.add('hidden');
	elements.content?.classList.remove('hidden');

	const track = currentTrack;

	if (!track) {
		root.dataset['state'] = 'idle';
		if (status) status.textContent = 'Connection';
		setLink(title, 'Nothing playing');
		setLink(artist, 'Music unavailable');
		setLink(elements.hoverTitle, 'Nothing playing');
		setLink(elements.hoverArtist, 'Music unavailable');
		if (elements.hoverCover) elements.hoverCover.removeAttribute('src');
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
	if (status)
		status.textContent = track.isPlaying
			? 'I am currently listening to'
			: 'The last song I listened to was';

	setLink(title, track.title, track.url ?? undefined);
	setLink(artist, track.artist, track.artistUrl ?? undefined);
	const imageUrl = coverImage(track.images);
	setLink(elements.hoverTitle, track.title, track.url ?? undefined);
	setLink(elements.hoverArtist, track.artist, track.artistUrl ?? undefined);
	if (elements.hoverCover) {
		if (imageUrl) {
			elements.hoverCover.src = imageUrl;
			elements.hoverCover.alt = `Cover art for ${track.title} by ${track.artist}`;
		} else {
			elements.hoverCover.removeAttribute('src');
			elements.hoverCover.alt = '';
		}
	}
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
	// The response already applies the 2-second drift threshold. Keep its chosen
	// progress anchor while the bar continues to interpolate locally.
	if (bar) bar.style.transitionProperty = 'none';
	if (key === renderedKey) {
		paintProgress();
	} else {
		renderedKey = key;
		updateTrack();
	}
	if (bar) {
		// Commit the new transform while transitions are disabled. Restore the CSS
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
	localProgress = Math.min(duration, progressBase + performance.now() - progressAnchor);
	const percent = Math.min(100, (localProgress / duration) * 100);
	const elements = els;
	if (elements?.bar) elements.bar.style.transform = `scaleX(${percent / 100})`;
	if (elements?.current) elements.current.textContent = formatTime(localProgress);
	setProgressAria(elements?.progress ?? null, localProgress, duration);
	if (elements?.hoverBar) elements.hoverBar.style.transform = `scaleX(${percent / 100})`;
	if (elements?.hoverCurrent) elements.hoverCurrent.textContent = formatTime(localProgress);
	if (elements?.hoverTotal) elements.hoverTotal.textContent = formatTime(duration);
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
			typeof data.source !== 'string' ||
			!['spotify', 'lastfm'].includes(data.source) ||
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
		const receivedProgress = Number.isFinite(data.progress) ? Math.max(0, data.progress ?? 0) : 0;
		const sameTrack =
			currentTrack !== null &&
			trackKey(currentTrack).split('|').slice(0, 4).join('|') ===
				trackKey(data).split('|').slice(0, 4).join('|');
		const now = performance.now();
		const predictedProgress = currentTrack?.isPlaying
			? Math.min(
					progressBase + now - progressAnchor,
					currentTrack.duration ?? Number.POSITIVE_INFINITY
				)
			: localProgress;
		currentTrack = data;
		localProgress =
			sameTrack && data.isPlaying && Math.abs(receivedProgress - predictedProgress) < 2000
				? predictedProgress
				: receivedProgress;
		progressBase = localProgress;
		progressAnchor = now;
		failures = 0;
		renderIfChanged();
		startProgress();
	} catch {
		// Keep the last known track visible during a transient network or API error.
		if (!document.hidden) {
			pollId = setTimeout(
				() => {
					pollId = undefined;
					void fetchNowPlaying();
				},
				Math.min(60_000, 2_000 * 2 ** failures++) + Math.random() * 250
			);
		}
	} finally {
		isFetching = false;
	}
	if (!document.hidden && pollId === undefined) {
		const duration = currentTrack?.duration ?? 0;
		const remaining = duration > 0 ? duration - localProgress + 400 : Infinity;
		const recommended = currentTrack?.stale
			? 30_000
			: (currentTrack?.next_poll_ms ?? POLL_INTERVAL);
		pollId = setTimeout(
			() => {
				pollId = undefined;
				void fetchNowPlaying();
			},
			Math.max(1000, Math.min(recommended, remaining)) + Math.random() * 250
		);
	}
}

function startPolling() {
	if (pollId === undefined && !document.hidden) void fetchNowPlaying();
}

function stopPolling() {
	if (pollId !== undefined) clearTimeout(pollId);
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
	removeWakeListeners?.();
	removeWakeListeners = undefined;

	els = queryEls();
	if (!els) return;
	renderedKey = null;
	const hoverTrigger = els.root.querySelector<HTMLElement>('[data-track-hover-trigger]');
	const tooltip = els.root.querySelector<HTMLElement>('[data-track-tooltip]');
	const positionTooltip = (x: number, y: number) => {
		if (!tooltip) return;
		const bounds = tooltip.getBoundingClientRect();
		const margin = 12;
		const offset = 16;
		const left =
			x + offset + bounds.width > window.innerWidth - margin
				? x - bounds.width - offset
				: x + offset;
		const top =
			y + offset + bounds.height > window.innerHeight - margin
				? y - bounds.height - offset
				: y + offset;
		tooltip.style.left = `${Math.max(margin, Math.min(left, window.innerWidth - bounds.width - margin))}px`;
		tooltip.style.top = `${Math.max(margin, Math.min(top, window.innerHeight - bounds.height - margin))}px`;
	};
	const onPointerMove = (event: PointerEvent) => positionTooltip(event.clientX, event.clientY);
	hoverTrigger?.addEventListener('pointermove', onPointerMove);

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
			if (wasHidden > POLL_INTERVAL) void fetchNowPlaying();
			startPolling();
			startProgress();
		}
	};
	document.addEventListener('visibilitychange', onVisibility);
	removeVisibility = () => document.removeEventListener('visibilitychange', onVisibility);
	const onOnline = () => {
		failures = 0;
		void fetchNowPlaying();
	};
	const onFocus = () => {
		if (performance.now() - progressAnchor > POLL_INTERVAL) void fetchNowPlaying();
	};
	window.addEventListener('online', onOnline);
	window.addEventListener('focus', onFocus);
	removeWakeListeners = () => {
		window.removeEventListener('online', onOnline);
		window.removeEventListener('focus', onFocus);
		hoverTrigger?.removeEventListener('pointermove', onPointerMove);
	};

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
	removeWakeListeners?.();
	removeWakeListeners = undefined;
	els = null;
});
document.addEventListener('astro:after-swap', initTrackPolling);

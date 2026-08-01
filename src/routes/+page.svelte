<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { formatDate, getHardcoverSrcset } from '$lib/utils';

	let { data }: { data: { allWritings: { title: string; date: string; file: string }[] } } =
		$props();

	const SPOTIFY_API_URL = 'https://spotify.kirkr.xyz/api/now-playing';
	const LASTFM_API_URL = 'https://lastfm.kirkr.xyz/api/lastfm-track';

	interface Book {
		id: number;
		title: string;
		subtitle: string | null;
		description: string | null;
		pages: number;
		release_date: string;
		release_year: number;
		rating: number;
		ratings_count: number;
		slug: string;
		cover_url: string;
		authors: string[];
		series: unknown[];
	}

	interface UserBook {
		status: string;
		rating: number | null;
		date_added: string;
		started_reading?: string;
		first_read_date?: string;
		last_read_date?: string;
		read_count: number;
		owned: boolean;
		starred: boolean;
		review: string | null;
	}

	interface Progress {
		pages_read: number;
		total_pages: number;
		percentage: number;
	}

	interface CurrentlyReading {
		book: Book;
		user_book: UserBook;
		progress: Progress | null;
		last_read_event: { event: string; action_at: string; entry: string | null } | null;
	}

	let currentlyReading: CurrentlyReading[] = $state([]);

	interface SpotifyImage {
		height: number;
		width: number;
		url: string;
	}

	interface SpotifyTrackData {
		isPlaying: boolean;
		title: string;
		artist: string;
		artistUrl?: string;
		album: string;
		images: SpotifyImage[];
		progress: number;
		duration: number;
		uri: string;
		songUrl?: string;
		externalUrl?: string;
		playedAt?: string;
	}

	interface LastFmTrackData {
		status: string;
		title: string;
		artist: string;
		images: Record<string, string>;
		trackUrl: string;
	}

	type DataSource = 'spotify' | 'lastfm' | null;

	let spotifyData: SpotifyTrackData | null = $state(null);
	let lastFmData: LastFmTrackData | null = $state(null);
	let dataSource: DataSource = $state(null);
	let localProgress = $state(0);
	let lastFetchTime = $state(0);
	let isFetching = $state(false);

	let intervalId: ReturnType<typeof setInterval> | undefined;
	let progressRafId: number | undefined;
	let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;

	async function fetchSpotifyTrack() {
		if (isFetching) return;
		isFetching = true;
		try {
			const response = await fetch(SPOTIFY_API_URL);
			if (!response.ok) throw new Error(`Spotify API responded with ${response.status}`);
			const data = await response.json();

			if (data.isPlaying === false && !data.title) {
				isFetching = false;
				if (retryTimeoutId) clearTimeout(retryTimeoutId);
				retryTimeoutId = setTimeout(() => fetchSpotifyTrack(), 30000);
				return;
			}

			if (data.isPlaying !== undefined) {
				spotifyData = data;
				localProgress = data.progress ?? 0;
				lastFetchTime = Date.now();
				dataSource = 'spotify';
				setupProgressUpdate();
				isFetching = false;
				return;
			}

			throw new Error('Invalid Spotify response');
		} catch (error) {
			console.info('Falling back to Last.fm:', error);
			isFetching = false;
			dataSource = 'lastfm';
			fetchLastFmTrack();
		}
	}

	async function fetchLastFmTrack() {
		try {
			const response = await fetch(LASTFM_API_URL);
			if (!response.ok) throw new Error(`Last.fm API responded with ${response.status}`);
			lastFmData = await response.json();
		} catch (error) {
			console.error('Error fetching Last.fm track:', error);
		}
	}

	function fetchCurrentTrack() {
		if (dataSource === 'lastfm') {
			fetchLastFmTrack();
		} else {
			fetchSpotifyTrack();
		}
	}

	function setupProgressUpdate() {
		if (progressRafId) {
			cancelAnimationFrame(progressRafId);
			progressRafId = undefined;
		}

		if (spotifyData?.isPlaying && localProgress < (spotifyData?.duration ?? 0)) {
			function tick() {
				if (!spotifyData?.isPlaying) return;

				const elapsed = Date.now() - lastFetchTime;
				const newProgress = (spotifyData?.progress ?? 0) + elapsed;
				const duration = spotifyData?.duration ?? 0;

				if (newProgress >= duration) {
					localProgress = duration;
					if (retryTimeoutId) clearTimeout(retryTimeoutId);
					retryTimeoutId = setTimeout(fetchSpotifyTrack, 500);
					return;
				}

				localProgress = newProgress;
				progressRafId = requestAnimationFrame(tick);
			}

			progressRafId = requestAnimationFrame(tick);
		}
	}

	function getLargestImage(images: SpotifyImage[]): string {
		if (!images || images.length === 0) return '';
		return images.reduce((best, img) => (img.width > best.width ? img : best)).url;
	}

	function generateSpotifySrcset(images: SpotifyImage[]): string {
		if (!images || images.length === 0) return '';
		return images.map((img) => `${img.url} ${img.width}w`).join(', ');
	}

	function generateLastFmSrcset(images: Record<string, string>): string {
		if (!images) return '';
		const mapping: Record<string, string> = {
			small: '34w',
			medium: '64w',
			large: '174w',
			extralarge: '300w',
			mega: '500w'
		};
		return Object.entries(images)
			.filter(([size, url]) => url && mapping[size])
			.map(([size, url]) => `${url} ${mapping[size]}`)
			.join(', ');
	}

	function formatAriaLabel(progress: number, duration: number) {
		const progressPercent = duration > 0 ? Math.round((progress / duration) * 100) : 0;
		return `${progressPercent}% played`;
	}

	function getLastFmFallback(images: Record<string, string>): string {
		if (!images) return '';
		return images['extralarge'] || images['large'] || images['medium'] || images['small'] || '';
	}

	function formatTime(ms: number) {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	const recentWritingsSlice = data.allWritings.slice(0, 5);

	onMount(() => {
		fetchSpotifyTrack();
		fetchCurrentlyReading();
		intervalId = setInterval(fetchCurrentTrack, 30000);
		return () => {
			if (intervalId) clearInterval(intervalId);
			if (progressRafId) cancelAnimationFrame(progressRafId);
			if (retryTimeoutId) clearTimeout(retryTimeoutId);
		};
	});

	const BOOKS_CACHE_TTL = 2 * 60 * 60 * 1000;

	function loadCachedBooks(): CurrentlyReading[] | null {
		try {
			const stored = localStorage.getItem('books-cache');
			if (!stored) return null;
			const parsed = JSON.parse(stored);
			if (parsed && Array.isArray(parsed.currentlyReading) && typeof parsed.timestamp === 'number') {
				if (Date.now() - parsed.timestamp > BOOKS_CACHE_TTL) {
					localStorage.removeItem('books-cache');
					return null;
				}
				return parsed.currentlyReading;
			}
			return null;
		} catch {
			return null;
		}
	}

	function saveCachedBooks(currentlyReading: CurrentlyReading[]) {
		try {
			localStorage.setItem('books-cache', JSON.stringify({ currentlyReading, timestamp: Date.now() }));
		} catch (e) {
			console.warn('Failed to cache books:', e);
		}
	}

	async function fetchCurrentlyReading() {
		const cached = loadCachedBooks();
		if (cached) {
			currentlyReading = cached;
			return;
		}
		try {
			const response = await fetch('https://hardcover.kirkr.xyz');
			if (!response.ok) throw new Error(`Status ${response.status}`);
			const data = await response.json();
			currentlyReading = data.currently_reading || [];
			saveCachedBooks(currentlyReading);
		} catch (e) {
			console.warn('Failed to fetch currently reading:', e);
		}
	};

	let currentTrack = $derived.by(() => {
		if (dataSource === 'spotify' && spotifyData) {
			return {
				source: 'Spotify',
				title: spotifyData.title,
				artist: spotifyData.artist,
				artistUrl: spotifyData.artistUrl,
				album: spotifyData.album,
				url: spotifyData.songUrl || spotifyData.externalUrl,
				imageUrl: getLargestImage(spotifyData.images),
				imageSrcset: generateSpotifySrcset(spotifyData.images),
				isPlaying: spotifyData.isPlaying,
				showProgress: spotifyData.isPlaying,
				duration: spotifyData.duration,
				progress: localProgress,
				playedAt: spotifyData.playedAt
			};
		}
		if (dataSource === 'lastfm' && lastFmData) {
			return {
				source: 'Last.fm',
				title: lastFmData.title,
				artist: lastFmData.artist,
				artistUrl: '',
				album: '',
				url: lastFmData.trackUrl,
				imageUrl: getLastFmFallback(lastFmData.images),
				imageSrcset: generateLastFmSrcset(lastFmData.images),
				isPlaying: lastFmData.status === 'Currently playing',
				showProgress: false,
				duration: 0,
				progress: 0,
				playedAt: undefined
			};
		}
		return null;
	});

	let progressPercentage = $derived(
		currentTrack && currentTrack.duration > 0
			? (currentTrack.progress / currentTrack.duration) * 100
			: 0
	);

	let sidebarOpen = $state(false);
	let mainContentEl: HTMLElement | undefined = $state();
	let sidebarTop = $state(40);

	$effect(() => {
		const el = mainContentEl;
		if (!el) return;
		const update = () => {
			const r = el.getBoundingClientRect();
			const p = el.parentElement;
			if (p) sidebarTop = r.top - p.getBoundingClientRect().top;
		};
		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	});
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<link rel="preconnect" href="https://i.scdn.co" />
</svelte:head>

<div class="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6 py-10 lg:py-16 relative">
	<main bind:this={mainContentEl} class="w-full max-w-[34rem]">
		<section class="pb-10">
			<div class="space-y-4 font-sans text-[16px] leading-[1.75] text-white/70">
				<p>
					My main academic interest is in computer engineering, particularly architecture. I'm a
					fan of C, Zig, and TypeScript, and web technologies in general; this site is built on
					Svelte.
				</p>
				<p>
					I also have an interest in politics, philosophy, and economics, as well as art, with a
					strong inclination towards the Dutch Golden Age, especially the Delft and Hague Schools.
				</p>
				<p>
				    See my <a href="/projects" class="underline decoration-white/55 underline-offset-2 transition-colors duration-75 hover:text-white hover:decoration-white">projects</a>, <a href="/writings" class="underline decoration-white/55 underline-offset-2 transition-colors duration-75 hover:text-white hover:decoration-white">writings</a>, or <a href="/photography" class="underline decoration-white/55 underline-offset-2 transition-colors duration-75 hover:text-white hover:decoration-white">photography</a>; or <button onclick={() => sidebarOpen = !sidebarOpen} class="underline decoration-white/55 underline-offset-2 transition-colors duration-75 hover:decoration-white cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit">see what i am doing</button>. Email me <a href="mailto:theo@kirkr.xyz" class="underline decoration-white/55 underline-offset-2 transition-colors duration-75 hover:text-white hover:decoration-white">here</a>, or take a look at my <a href="https://github.com/KIRKR101" class="underline decoration-white/55 underline-offset-2 transition-colors duration-75 hover:text-white hover:decoration-white">github</a>.
				</p>
			</div>
		</section>

		<div class="h-px bg-bd"></div>

		<section class="cv-auto py-10">
			<div class="mb-6 flex items-baseline justify-between">
				<div class="font-serif text-[24px] text-white/85 italic">Writings</div>
				<a
					href="/writings"
					class="font-sans text-[10px] tracking-[0.15em] text-muted uppercase no-underline hover:text-white/60"
				>
					All writings ↗
				</a>
			</div>

			<div class="flex flex-col">
				{#each recentWritingsSlice as writing (writing.file)}
				    <a
						href="/writing/{writing.file}"
						class="group flex w-full items-baseline justify-between py-3 no-underline"
					>
						<span
							class="font-sans text-[13px] text-white/70 transition-colors duration-100 group-hover:text-white hover:underline hover:decoration-white/70 hover:underline-offset-2"
							>{writing.title}</span
						>
						<span class="font-mono text-[11px] tracking-wider text-muted/60 uppercase"
							>{formatDate(writing.date)}</span
						>
					</a>
				{/each}
			</div>
		</section>
	</main>

	<button
		class="absolute right-8 hidden lg:flex items-center justify-center w-5 h-5 text-white/10 hover:text-white/30 transition-all duration-200 z-10 select-none"
		style="top: {sidebarTop - 26}px"
		onclick={() => sidebarOpen = !sidebarOpen}
		aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
	>
		<svg
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			class="transition-transform duration-200"
			class:rotate-180={sidebarOpen}
		>
			<path d="M4.5 9.5L8 6 4.5 2.5"/>
		</svg>
	</button>

	{#if sidebarOpen}
		<div
			class="absolute right-8 hidden lg:block w-[280px]"
			style="top: {sidebarTop}px"
			transition:fly={{ x: 20, duration: 200 }}
		>
			<section class="pb-10">
				<div class="mb-6 font-sans text-[11px] tracking-[0.14em] text-muted uppercase font-light">
					{#if currentTrack}
						{currentTrack.isPlaying ? 'Now playing' : 'Last played'} · {currentTrack.source}
					{:else}
						Initialising
					{/if}
				</div>

				<div class="flex items-start gap-5">
					<div class="h-20 w-20 shrink-0 overflow-hidden rounded-[2px] bg-art-bg">
						{#if currentTrack}
							{#if currentTrack.url}
								<a href={currentTrack.url} target="_blank" rel="noopener noreferrer">
									<img
										srcset={currentTrack.imageSrcset}
										sizes="(max-width: 768px) 80px, 96px"
										src={currentTrack.imageUrl}
										alt={currentTrack.title}
										class="h-full w-full object-cover"
										fetchpriority="high"
									/>
								</a>
							{:else}
								<img
									srcset={currentTrack.imageSrcset}
									sizes="(max-width: 768px) 80px, 96px"
									src={currentTrack.imageUrl}
									alt={currentTrack.title}
									class="h-full w-full object-cover"
									fetchpriority="high"
								/>
							{/if}
						{/if}
					</div>

					<div class="min-w-0 flex-1 pt-0.5">
						<div class="truncate font-serif text-[19px] leading-tight text-white/85 italic">
							{#if currentTrack}
								{#if currentTrack.url}
								    <a
										href={currentTrack.url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-inherit no-underline transition-colors hover:text-white"
									>
										{currentTrack.title}
									</a>
								{:else}
									{currentTrack.title}
								{/if}
							{:else}
								Loading
							{/if}
						</div>
						<div class="mt-1 truncate font-sans text-[11px] tracking-wide text-muted">
							{#if currentTrack}
								{#if currentTrack.artistUrl}
								    <a
										href={currentTrack.artistUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-inherit no-underline transition-colors hover:text-white/78"
									>
										{currentTrack.artist}
									</a>
								{:else}
									{currentTrack.artist}
								{/if}
								{#if currentTrack.album}
									{' · ' + currentTrack.album}
								{/if}
							{/if}
						</div>

						{#if currentTrack?.showProgress}
							<div
								class="relative mt-3 h-px bg-rail"
								aria-label={formatAriaLabel(currentTrack.progress, currentTrack.duration)}
							>
								<div class="absolute inset-y-0 left-0 h-full bg-prog" style="width: {progressPercentage}%"></div>
							</div>
							<div class="mt-1.5 flex justify-between font-mono text-[9px] text-muted">
								<span>{formatTime(currentTrack.progress)}</span>
								<span>{formatTime(currentTrack.duration)}</span>
							</div>
						{/if}
					</div>
				</div>
			</section>

			{#if currentlyReading.length > 0}
				<div class="mt-10">
					<div class="mb-6 font-sans text-[11px] tracking-[0.14em] text-muted uppercase font-light">
						Currently Reading
					</div>
					<div class="space-y-5">
						{#each currentlyReading as item (item.book.id)}
							<div class="flex gap-3">
								<div
									class="relative flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-bd bg-[#141416] text-white/20"
								>
									<span
										class="-rotate-[315deg] text-center font-serif text-[10px] leading-tight tracking-wide select-none"
										aria-hidden="true"
									>
										{item.book.title}
									</span>
									<img
										src={item.book.cover_url}
										srcset={getHardcoverSrcset(item.book.cover_url)}
										sizes="80px"
										alt={item.book.title}
										class="absolute inset-0 h-full w-full rounded-sm object-cover"
										loading="lazy"
										onerror={(e) => ((e.target as HTMLElement).style.opacity = '0')}
									/>
								</div>
								<div class="flex min-w-0 flex-1 flex-col justify-center">
									<div class="truncate font-serif text-[16px] leading-tight text-white/90">
										<a
											href="https://hardcover.app/books/{item.book.slug}?referrer_id=120657"
											target="_blank"
											rel="noopener noreferrer"
											class="text-inherit no-underline transition-colors duration-75 hover:text-white/80"
										>
											{item.book.title}
										</a>
									</div>
									<div class="mt-0.5 truncate font-mono text-[10px] tracking-wider text-muted">
										{item.book.authors[0] ?? 'Unknown author'}
									</div>
									{#if item.progress}
										<div class="mt-2 font-mono text-[10px] tracking-wider text-muted">
											{Math.round(item.progress.percentage)}% · {item.progress.pages_read}/{item.progress.total_pages}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

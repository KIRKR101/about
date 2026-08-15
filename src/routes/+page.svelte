<script lang="ts">
	import { untrack } from 'svelte';
	import { slide } from 'svelte/transition';
	import { formatDate, getHardcoverSrcset } from '$lib/utils';
	import Footer from '$lib/components/Footer.svelte';

	let {
		data
	}: {
		data: {
			allWritings: { title: string; date: string; file: string; snippet: string | null }[];
			allProjects: {
				id: string;
				title: string;
				shortDescription: string;
				github: string;
				firstCommit: string;
			}[];
		};
	} = $props();

	let allProjects = $derived(data.allProjects);
	let allWritings = $derived(data.allWritings);
	let activityOpen = $state(false);
	let visibleProjects = $derived(allProjects.slice(0, 5));
	let visibleWritings = $derived(allWritings.slice(0, 5));

	const SPOTIFY_API_URL = 'https://spotify.kirkr.xyz/api/now-playing';
	const LASTFM_API_URL = 'https://lastfm.kirkr.xyz/api/lastfm-track';
	const BOOKS_CACHE_TTL = 2 * 60 * 60 * 1000;

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

	let currentlyReading: CurrentlyReading[] = $state([]);
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

			if (!response.ok) {
				throw new Error(`Spotify API status ${response.status}`);
			}

			const data = await response.json();

			if (data.isPlaying === false && !data.title) {
				if (retryTimeoutId) clearTimeout(retryTimeoutId);
				retryTimeoutId = setTimeout(fetchSpotifyTrack, 30_000);
				return;
			}

			if (data.isPlaying === undefined) {
				throw new Error('Invalid Spotify response');
			}

			if (retryTimeoutId) {
				clearTimeout(retryTimeoutId);
				retryTimeoutId = undefined;
			}

			spotifyData = data;
			localProgress = data.progress ?? 0;
			lastFetchTime = Date.now();
			dataSource = 'spotify';

			setupProgressUpdate();
		} catch {
			dataSource = 'lastfm';
			await fetchLastFmTrack();
		} finally {
			isFetching = false;
		}
	}

	async function fetchLastFmTrack() {
		try {
			const response = await fetch(LASTFM_API_URL);
			if (response.ok) {
				lastFmData = await response.json();
			}
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

	function generateSpotifySrcset(images: SpotifyImage[] = []): string {
		return images.map((img) => `${img.url} ${img.width}w`).join(', ');
	}

	function generateLastFmSrcset(images: Record<string, string> = {}): string {
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

	function formatTime(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function loadCachedBooks(): CurrentlyReading[] | null {
		try {
			const stored = localStorage.getItem('books-cache');
			if (!stored) return null;
			const parsed = JSON.parse(stored);
			if (Array.isArray(parsed?.currentlyReading) && typeof parsed.timestamp === 'number') {
				if (Date.now() - parsed.timestamp > BOOKS_CACHE_TTL) {
					localStorage.removeItem('books-cache');
					return null;
				}
				return parsed.currentlyReading;
			}
		} catch {
			// Ignore
		}
		return null;
	}

	function saveCachedBooks(books: CurrentlyReading[]) {
		try {
			localStorage.setItem(
				'books-cache',
				JSON.stringify({ currentlyReading: books, timestamp: Date.now() })
			);
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
	}

	let currentTrack = $derived.by(() => {
		if (dataSource === 'spotify' && spotifyData) {
			const largest = spotifyData.images?.reduce(
				(best, img) => (img.width > best.width ? img : best),
				spotifyData.images[0]!
			);
			return {
				source: 'Spotify',
				title: spotifyData.title,
				artist: spotifyData.artist,
				artistUrl: spotifyData.artistUrl,
				album: spotifyData.album,
				url: spotifyData.songUrl || spotifyData.externalUrl,
				imageUrl: largest?.url ?? '',
				imageSrcset: generateSpotifySrcset(spotifyData.images),
				isPlaying: spotifyData.isPlaying,
				showProgress: spotifyData.isPlaying,
				duration: spotifyData.duration,
				progress: localProgress
			};
		}
		if (dataSource === 'lastfm' && lastFmData) {
			const imgs = lastFmData.images || {};
			const fallback = imgs['extralarge'] || imgs['large'] || imgs['medium'] || imgs['small'] || '';
			return {
				source: 'Last.fm',
				title: lastFmData.title,
				artist: lastFmData.artist,
				artistUrl: '',
				album: '',
				url: lastFmData.trackUrl,
				imageUrl: fallback,
				imageSrcset: generateLastFmSrcset(imgs),
				isPlaying: lastFmData.status === 'Currently playing',
				showProgress: false,
				duration: 0,
				progress: 0
			};
		}
		return null;
	});

	let progressPercentage = $derived(
		currentTrack && currentTrack.duration > 0
			? (currentTrack.progress / currentTrack.duration) * 100
			: 0
	);

	$effect(() => {
		if (!activityOpen) return;
		untrack(() => {
			fetchSpotifyTrack();
			fetchCurrentlyReading();
			intervalId = setInterval(fetchCurrentTrack, 30000);
		});
		return () => {
			if (intervalId) clearInterval(intervalId);
			if (progressRafId) cancelAnimationFrame(progressRafId);
			if (retryTimeoutId) clearTimeout(retryTimeoutId);
		};
	});
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<link rel="preconnect" href="https://i.scdn.co" />
</svelte:head>

<div class="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6 py-6 md:py-16">
	<main class="w-full max-w-[600px]">
		<section class="pb-6">
			<div class="flex items-start gap-6">
				<div class="min-w-0">
					<p class="-mt-[0.15em] font-sans text-[15.5px] leading-[1.75] text-ink-70">
						I'm a first year CompE student at Warwick. I enjoy C and TypeScript, and web tech
						more generally; this site is built on Svelte. I'm also interested in politics,
						philosophy, economics and art - particularly Dutch.
					</p>

					<button
						type="button"
						class="mt-4 inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] tracking-wider text-ink-70 uppercase transition-colors duration-150 hover:text-ink"
						onclick={() => (activityOpen = !activityOpen)}
					>
						<span class="decoration-ink/20 underline-offset-2 hover:underline"
							>See current activity</span
						>
						<span>{activityOpen ? '[-]' : '[+]'}</span>
					</button>
				</div>

				<div class="hidden w-66 shrink-0 rounded-sm sm:block">
					<img
						src="/hero.webp"
						alt="Sketch of Landscape with Person on a Path by Anton Mauve"
						class="w-66 rounded-sm object-cover dark:invert"
						loading="lazy"
					/>
				</div>
			</div>
		</section>

		{#if activityOpen}
			<div transition:slide={{ duration: 200 }} class="space-y-6 pb-6">
				<section class="w-full">
					<div class="mb-6 h-px bg-bd"></div>

					<div class="mb-4 font-sans text-[11px] tracking-[0.1em] text-ink-70 uppercase">
						{#if currentTrack}
							{currentTrack.isPlaying ? 'Now playing' : 'Last listen'}
						{:else}
							Initialising
						{/if}
					</div>
					<div class="flex items-start gap-4">
						<div class="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-art-bg">
							{#if currentTrack}
								{#if currentTrack.url}
									<a href={currentTrack.url} target="_blank" rel="noopener noreferrer">
										<img
											srcset={currentTrack.imageSrcset}
											sizes="64px"
											src={currentTrack.imageUrl}
											alt={currentTrack.title}
											class="h-full w-full object-cover"
											fetchpriority="high"
										/>
									</a>
								{:else}
									<img
										srcset={currentTrack.imageSrcset}
										sizes="64px"
										src={currentTrack.imageUrl}
										alt={currentTrack.title}
										class="h-full w-full object-cover"
										fetchpriority="high"
									/>
								{/if}
							{/if}
						</div>

						<div class="min-w-0 flex-1">
							<div class="truncate font-serif text-[15px] leading-tight text-ink-90">
								{#if currentTrack}
									{#if currentTrack.url}
										<a
											href={currentTrack.url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-inherit no-underline transition-colors duration-75 hover:text-ink-80"
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
							<div class="mt-1 truncate font-sans text-[11px] tracking-wide text-ink-70">
								{#if currentTrack}
									{#if currentTrack.artistUrl}
										<a
											href={currentTrack.artistUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="text-inherit no-underline transition-colors hover:text-ink-70"
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
									aria-label={`${Math.round(progressPercentage)}% played`}
								>
									<div
										class="absolute inset-y-0 left-0 h-full bg-ink/30"
										style="width: {progressPercentage}%"
									></div>
								</div>
								<div class="mt-1.5 flex justify-between font-mono text-[9px] text-ink-70">
									<span>{formatTime(currentTrack.progress)}</span>
									<span>{formatTime(currentTrack.duration)}</span>
								</div>
							{/if}
						</div>
					</div>
				</section>

				{#if currentlyReading.length > 0}
					<section class="w-full">
						<div class="mb-4 font-sans text-[11px] tracking-[0.1em] text-ink-70 uppercase">
							Currently Reading
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each currentlyReading as item (item.book.id)}
								<div class="flex gap-3">
									<a
										href="https://hardcover.app/books/{item.book.slug}?referrer_id=120657"
										target="_blank"
										rel="noopener noreferrer"
										class="relative flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-bd bg-card-bg text-ink-20"
									>
										<span
											class="-rotate-[315deg] text-center font-serif text-[9px] leading-tight tracking-wide select-none"
											aria-hidden="true"
										>
											{item.book.title}
										</span>
										<img
											src={item.book.cover_url}
											srcset={getHardcoverSrcset(item.book.cover_url)}
											sizes="56px"
											alt={item.book.title}
											class="absolute inset-0 h-full w-full rounded-sm object-cover"
											loading="lazy"
											onerror={(e) => ((e.target as HTMLElement).style.opacity = '0')}
										/>
									</a>
									<div class="flex min-w-0 flex-1 flex-col justify-center">
										<div class="truncate font-serif text-[15px] leading-tight text-ink-90">
											<a
												href="https://hardcover.app/books/{item.book.slug}?referrer_id=120657"
												target="_blank"
												rel="noopener noreferrer"
												class="text-inherit no-underline transition-colors duration-75 hover:text-ink-80"
											>
												{item.book.title}
											</a>
										</div>
										<div class="mt-0.5 truncate font-mono text-[10px] tracking-wider text-ink-70">
											{item.book.authors[0] ?? 'Unknown author'}
										</div>
										{#if item.progress}
											<div class="mt-1.5 font-mono text-[10px] tracking-wider text-ink-70">
												{Math.round(item.progress.percentage)}% · {item.progress.pages_read}/{item
													.progress.total_pages}
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</section>
				{/if}
			</div>
		{/if}

		<section class="cv-auto py-6">
			<div class="mb-4 flex items-baseline justify-between">
				<div class="font-serif text-[24px] text-ink-90 italic">Writings</div>
				<a
					href="/writings"
					class="group mt-4 inline-flex cursor-pointer items-center gap-1.5 self-start font-mono text-[11px] tracking-wider text-ink-70 uppercase transition-colors duration-150 hover:text-ink"
					>[+]</a
				>
			</div>

			<div class="mb-4 h-px bg-bd"></div>

			<div class="flex flex-col">
				{#each visibleWritings as writing (writing.file)}
					<a
						href={`/writing/${writing.file}`}
						class="group flex w-full flex-col border-b border-bd/30 py-3 no-underline last:border-0"
					>
						<div class="flex w-full items-baseline justify-between">
							<span
								class="font-sans text-[14px] text-ink-70 transition-colors duration-100 group-hover:text-ink hover:underline hover:decoration-ink/70 hover:underline-offset-2"
							>
								{writing.title}
							</span>
							<span class="shrink-0 font-mono text-[11px] tracking-wider text-ink-70 uppercase">
								{formatDate(writing.date)}
							</span>
						</div>
						{#if writing.snippet}
							<span class="mt-1 line-clamp-2 font-sans text-[12px] leading-relaxed text-ink-70">
								{writing.snippet}
							</span>
						{/if}
					</a>
				{/each}
			</div>
		</section>

		<section class="cv-auto pt-6">
			<div class="mb-4 flex items-baseline justify-between">
				<div class="font-serif text-[24px] text-ink-90 italic">Projects</div>
				<a
					href="/projects"
					class="group mt-4 inline-flex cursor-pointer items-center gap-1.5 self-start font-mono text-[11px] tracking-wider text-ink-70 uppercase transition-colors duration-150 hover:text-ink"
					>[+]</a
				>
			</div>

			<div class="mb-4 h-px bg-bd"></div>

			<div class="flex flex-col">
				{#each visibleProjects as project (project.title)}
					<a
						href={`/project/${project.id}`}
						class="group flex w-full flex-col border-b border-bd/30 py-3 no-underline last:border-0"
					>
						<div class="flex w-full items-baseline justify-between">
							<span
								class="font-sans text-[14px] text-ink-70 transition-colors duration-100 group-hover:text-ink hover:underline hover:decoration-ink/70 hover:underline-offset-2"
							>
								{project.title}
							</span>
							<span class="shrink-0 font-mono text-[11px] tracking-wider text-ink-70 uppercase">
								{project.firstCommit}
							</span>
						</div>
						{#if project.shortDescription}
							<span class="mt-2 line-clamp-2 font-sans text-[12px] leading-relaxed text-ink-70">
								{project.shortDescription}
							</span>
						{/if}
					</a>
				{/each}
			</div>
		</section>

		<Footer />
	</main>
</div>

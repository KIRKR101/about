<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { formatDate, getHardcoverSrcset } from '$lib/utils';

	let {
		data
	}: {
		data: {
			allWritings: { title: string; date: string; file: string; snippet: string | null }[];
			allProjects: { id: string; title: string; description: string; github: string }[];
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
			if (!response.ok) throw new Error(`Spotify API status ${response.status}`);
			const data = await response.json();

			if (data.isPlaying === false && !data.title) {
				isFetching = false;
				if (retryTimeoutId) clearTimeout(retryTimeoutId);
				retryTimeoutId = setTimeout(fetchSpotifyTrack, 30000);
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
		} catch {
			isFetching = false;
			dataSource = 'lastfm';
			fetchLastFmTrack();
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
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<link rel="preconnect" href="https://i.scdn.co" />
</svelte:head>

<div class="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6 py-10 lg:py-16">
	<main class="w-full max-w-[34rem]">
		<section class="pb-6">
			<div class="space-y-4 font-sans text-[15px] leading-[1.75] text-white/70">
				<p>
					My main academic interest is in computer engineering, particularly architecture. I'm a fan
					of C, Zig, and TypeScript, and web technologies in general; this site is built on Svelte.
				</p>
				<p>
					I also have an interest in politics, philosophy, and economics, as well as art, with a
					strong inclination towards the Dutch Golden Age, especially the Delft and Hague Schools.
				</p>
				<p>
				    Email me
					<a
						href="mailto:theo@kirkr.xyz"
						class="underline decoration-white/55 underline-offset-2 transition-colors duration-75 hover:text-white hover:decoration-white"
						>here</a
					>, or take a look at my
					<a
						href="https://github.com/KIRKR101"
						class="underline decoration-white/55 underline-offset-2 transition-colors duration-75 hover:text-white hover:decoration-white"
						>github</a
					>.
				</p>

				<button
					type="button"
					class="inline-flex cursor-pointer items-center gap-1.5 self-start font-mono text-[11px] tracking-wider text-muted/60 uppercase transition-colors duration-150 hover:text-white/85"
					onclick={() => (activityOpen = !activityOpen)}
				>
					<span>See current activity</span>
					<svg
						width="10"
						height="10"
						viewBox="0 0 12 12"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						class="transition-transform duration-150"
						class:rotate-180={activityOpen}
					>
						<path d="M2.5 4.5L6 8L9.5 4.5" />
					</svg>
				</button>
			</div>
		</section>

		{#if activityOpen}
			<div transition:slide={{ duration: 200 }} class="space-y-6 pb-6">
				<section class="w-full">
					<div class="mb-3 font-sans text-[11px] font-light tracking-[0.14em] text-muted uppercase">
						{#if currentTrack}
							{currentTrack.isPlaying ? 'Now playing' : 'Last played'} · {currentTrack.source}
						{:else}
							Initialising
						{/if}
					</div>

					<div class="mb-6 h-px bg-bd"></div>

					<div class="flex items-start gap-4">
						<div class="h-16 w-16 shrink-0 overflow-hidden rounded-[2px] bg-art-bg">
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
							<div class="truncate font-serif text-[15px] leading-tight text-white/90">
								{#if currentTrack}
									{#if currentTrack.url}
										<a
											href={currentTrack.url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-inherit no-underline transition-colors duration-75 hover:text-white/80"
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
									aria-label={`${Math.round(progressPercentage)}% played`}
								>
									<div
										class="absolute inset-y-0 left-0 h-full bg-prog"
										style="width: {progressPercentage}%"
									></div>
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
					<section class="w-full">
						<div
							class="mb-4 font-sans text-[11px] font-light tracking-[0.14em] text-muted uppercase"
						>
							Currently Reading
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each currentlyReading as item (item.book.id)}
								<div class="flex gap-3">
									<a
										href="https://hardcover.app/books/{item.book.slug}?referrer_id=120657"
										target="_blank"
										rel="noopener noreferrer"
										class="relative flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-bd bg-[#141416] text-white/20"
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
										<div class="truncate font-serif text-[15px] leading-tight text-white/90">
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
											<div class="mt-1.5 font-mono text-[10px] tracking-wider text-muted">
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
				<div class="font-serif text-[24px] text-white/85 italic">Writings</div>
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
								class="font-sans text-[14px] text-white/70 transition-colors duration-100 group-hover:text-white hover:underline hover:decoration-white/70 hover:underline-offset-2"
							>
								{writing.title}
							</span>
							<span class="shrink-0 font-mono text-[11px] tracking-wider text-muted/60">
								{formatDate(writing.date)}
							</span>
						</div>
						{#if writing.snippet}
							<span class="mt-1 line-clamp-2 font-sans text-[12px] leading-relaxed text-white/40">
								{writing.snippet}
							</span>
						{/if}
					</a>
				{/each}
				<a
					href="/writings"
					class="mt-4 inline-flex cursor-pointer items-center gap-1.5 self-start font-mono text-[11px] tracking-wider text-muted/60 uppercase no-underline transition-colors duration-150 hover:text-white/85"
				>
					View all
				</a>
			</div>
		</section>

		<section class="cv-auto py-6">
			<div class="mb-4 flex items-baseline justify-between">
				<div class="font-serif text-[24px] text-white/85 italic">Projects</div>
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
								class="font-sans text-[14px] text-white/70 transition-colors duration-100 group-hover:text-white hover:underline hover:decoration-white/70 hover:underline-offset-2"
							>
								{project.title}
							</span>
						</div>
						<span class="mt-2 line-clamp-2 font-sans text-[12px] leading-relaxed text-white/40">
							{project.description}
						</span>
					</a>
				{/each}
				<button
					type="button"
					class="group mt-4 inline-flex cursor-pointer items-center gap-1.5 self-start font-mono text-[11px] tracking-wider text-muted/60 uppercase transition-colors duration-150 hover:text-white/85"
				>
					<a href="/projects">View all</a>
				</button>
			</div>
		</section>
	</main>
</div>

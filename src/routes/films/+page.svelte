<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';

	interface FilmItem {
		title: string;
		year: string;
		link: string;
		poster: string;
		rating: string;
		watchedDate: string;
		rewatch: boolean;
	}

	let films: FilmItem[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const CACHE_TTL = 60 * 60 * 1000;

	function loadCachedFilms(): FilmItem[] | null {
		try {
			const stored = localStorage.getItem('films-cache');
			if (!stored) return null;
			const parsed = JSON.parse(stored);
			if (parsed && typeof parsed.timestamp === 'number' && Array.isArray(parsed.data)) {
				if (Date.now() - parsed.timestamp > CACHE_TTL) {
					localStorage.removeItem('films-cache');
					return null;
				}
				return parsed.data as FilmItem[];
			}
			return null;
		} catch {
			return null;
		}
	}

	function saveCachedFilms(films: FilmItem[]) {
		try {
			localStorage.setItem('films-cache', JSON.stringify({ data: films, timestamp: Date.now() }));
		} catch {
			// localStorage not available
		}
	}

	async function fetchFilms() {
		const cached = loadCachedFilms();
		if (cached) {
			films = cached;
			error = null;
			loading = false;
			return;
		}

		try {
			loading = true;
			error = null;
			const rssFeedUrl = 'https://letterboxd.kirkr.xyz/kirkr101/rss/';

			const response = await fetch(rssFeedUrl);
			if (!response.ok) throw new Error(`Status ${response.status}`);

			const xmlText = await response.text();
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

			if (xmlDoc.querySelector('parsererror')) {
				throw new Error('Parse Error');
			}

			const items = xmlDoc.querySelectorAll('item');
			if (items.length === 0) {
				error = 'No films found.';
				loading = false;
				return;
			}

			const filmItems: FilmItem[] = [];
			items.forEach((item) => {
				const link = item.querySelector('link')?.textContent?.trim() || '#';
				const filmTitle = item.querySelector('filmTitle')?.textContent || 'Unknown Film';
				const filmYear = item.querySelector('filmYear')?.textContent || '';
				const memberRating = item.querySelector('memberRating')?.textContent || '';
				const watchedDate = item.querySelector('watchedDate')?.textContent;
				const rewatch = item.querySelector('rewatch')?.textContent === 'Yes';

				const description = item.querySelector('description')?.textContent || '';
				const doc = parser.parseFromString(description, 'text/html');
				const posterImg = doc.querySelector('img');
				let posterUrl = posterImg ? posterImg.getAttribute('src')?.trim() || '' : '';

				if (posterUrl.includes('/resized/')) {
					posterUrl = posterUrl.replace(/-0-\d+-0-\d+-crop\.jpg/, '-0-200-0-300-crop.jpg');
				}

				const watchedDateFormatted = watchedDate
					? new Date(watchedDate).toLocaleDateString(undefined, {
							timeZone: 'UTC',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})
					: 'N/A';

				filmItems.push({
					title: filmTitle,
					year: filmYear,
					link,
					poster: posterUrl,
					rating: memberRating,
					watchedDate: watchedDateFormatted,
					rewatch
				});
			});

			films = filmItems;
			saveCachedFilms(filmItems);
			loading = false;
		} catch {
			error = 'Failed to load films.';
			loading = false;
		}
	}

	$effect(() => {
		fetchFilms();
	});

	const createStarRating = (ratingStr: string) => {
		if (!ratingStr) return '';
		const rating = parseFloat(ratingStr);
		if (isNaN(rating)) return '';

		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;
		let starsHtml = '★'.repeat(fullStars);
		if (hasHalfStar) starsHtml += '½';

		return starsHtml;
	};
</script>

<svelte:head>
	<title>Films | kirkr.xyz</title>
	<meta name="description" content="A log of recently watched films." />
	<meta name="robots" content="index, follow" />
	<link rel="preconnect" href="https://letterboxd.kirkr.xyz" crossorigin="anonymous" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 md:py-16">
	<main class="w-full max-w-[600px]">
		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-ink">
				<span class="opacity-90">Films</span><span class="opacity-40">.</span>
			</h1>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		{#if loading}
			<div class="py-8 text-center">
				<div class="font-mono text-[11px] tracking-[0.1em] text-ink-70 uppercase">
					Loading films...
				</div>
			</div>
		{:else if error}
			<div class="rounded-sm border border-bd bg-ink/5 py-8 text-center">
				<div class="font-mono text-[11px] tracking-[0.1em] text-ink-70 uppercase">
					Failed to load films
				</div>
			</div>
		{:else}
			<div class="mb-12 space-y-6">
				{#each films as film (film.link)}
					<div class="flex gap-4 border-b border-bd pb-6 last:border-0">
						<div
							class="relative flex h-48 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-bd bg-card-bg text-ink-20"
						>
							<span
								class="-rotate-[315deg] text-center font-serif text-[13px] leading-tight tracking-wide select-none"
								aria-hidden="true"
							>
								{film.title}
							</span>
							<img
								src={film.poster}
								alt={film.title}
								class="absolute inset-0 h-full w-full rounded-sm object-cover"
								loading="lazy"
								onerror={(e) => ((e.target as HTMLElement).style.opacity = '0')}
							/>
						</div>
						<div class="flex flex-col justify-center">
							<div class="font-serif text-[20px] leading-tight text-ink-90">
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a
									href={film.link}
									target="_blank"
									rel="noopener noreferrer"
									class="text-inherit no-underline transition-colors duration-75 hover:text-ink-80"
								>
									{film.title}
								</a>
							</div>
							<div class="mt-1 font-mono text-[11px] tracking-wider text-ink-70">{film.year}</div>
							{#if film.rating}
								<div class="mt-1 text-[15px] text-ink-50">
									{createStarRating(film.rating)}
								</div>
							{/if}
							<div class="mt-2 font-mono text-[11px] tracking-wider text-ink-70">
								Watched: {film.watchedDate}
								{#if film.rewatch}
									<span class="ml-2 text-ink-40">↻ Rewatch</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<Footer />
	</main>
</div>

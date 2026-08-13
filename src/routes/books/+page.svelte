<script lang="ts">
	import { onMount } from 'svelte';
	import { getHardcoverSrcset } from '$lib/utils';
	import Footer from '$lib/components/Footer.svelte';

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

	interface LastReadEvent {
		event: string;
		action_at: string;
		entry: string | null;
	}

	interface CurrentlyReading {
		book: Book;
		user_book: UserBook;
		progress: Progress | null;
		last_read_event: LastReadEvent | null;
	}

	interface PreviouslyRead {
		book: Book;
		user_book: UserBook;
	}

	let currentlyReading: CurrentlyReading[] = $state([]);
	let previouslyRead: PreviouslyRead[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const CACHE_TTL = 2 * 60 * 60 * 1000;

	function loadCachedBooks(): {
		currentlyReading: CurrentlyReading[];
		previouslyRead: PreviouslyRead[];
	} | null {
		try {
			const stored = localStorage.getItem('books-cache');
			if (!stored) return null;
			const parsed = JSON.parse(stored);
			if (
				parsed &&
				typeof parsed.timestamp === 'number' &&
				Array.isArray(parsed.currentlyReading) &&
				Array.isArray(parsed.previouslyRead)
			) {
				if (Date.now() - parsed.timestamp > CACHE_TTL) {
					localStorage.removeItem('books-cache');
					return null;
				}
				return {
					currentlyReading: parsed.currentlyReading,
					previouslyRead: parsed.previouslyRead
				};
			}
			return null;
		} catch {
			return null;
		}
	}

	function saveCachedBooks(currentlyReading: CurrentlyReading[], previouslyRead: PreviouslyRead[]) {
		try {
			localStorage.setItem(
				'books-cache',
				JSON.stringify({
					currentlyReading,
					previouslyRead,
					timestamp: Date.now()
				})
			);
		} catch (e) {
			console.warn('Failed to cache books:', e);
		}
	}

	async function fetchBooks() {
		const cached = loadCachedBooks();
		if (cached) {
			currentlyReading = cached.currentlyReading;
			previouslyRead = cached.previouslyRead;
			error = null;
			loading = false;
			return;
		}

		try {
			loading = true;
			error = null;
			const apiUrl = 'https://hardcover.kirkr.xyz';

			const response = await fetch(apiUrl);
			if (!response.ok) throw new Error(`Status ${response.status}`);

			const data = await response.json();

			currentlyReading = data.currently_reading || [];
			previouslyRead = data.previously_read || [];

			saveCachedBooks(currentlyReading, previouslyRead);
			loading = false;
		} catch {
			error = 'Failed to load books.';
			loading = false;
		}
	}

	onMount(() => {
		fetchBooks();
	});

	const createStarRating = (rating: number | null) => {
		if (rating === null || rating === undefined) return '';
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 !== 0;
		let starsHtml = '★'.repeat(fullStars);
		if (hasHalfStar) starsHtml += '½';
		return starsHtml;
	};

	const formatDate = (dateStr: string | undefined) => {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleDateString(undefined, {
			timeZone: 'Europe/London',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const formatDateTime = (dateStr: string | undefined) => {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleString(undefined, {
			timeZone: 'Europe/London',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<svelte:head>
	<title>Books | kirkr.xyz</title>
	<meta name="description" content="A log of books currently reading and previously read." />
	<meta name="robots" content="index, follow" />
	<link rel="preconnect" href="https://hardcover.kirkr.xyz" crossorigin="anonymous" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 md:py-16">
	<main class="w-full max-w-[600px]">
		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-ink">
				<span class="opacity-90">Books</span><span class="opacity-40">.</span>
			</h1>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		{#if loading}
			<div class="py-8 text-center">
				<div class="font-mono text-[11px] tracking-[0.1em] text-ink-70 uppercase">
					Loading books...
				</div>
			</div>
		{:else if error}
			<div class="rounded-sm border border-bd bg-ink/5 py-8 text-center">
				<div class="font-mono text-[11px] tracking-[0.1em] text-ink-70 uppercase">
					Failed to load books
				</div>
			</div>
		{:else}
			{#if currentlyReading.length > 0}
				<div class="mb-6">
					<div class="mb-6 font-sans text-[11px] tracking-[0.1em] text-ink-70 uppercase">
						Currently Reading
					</div>
					<div class="space-y-6">
						{#each currentlyReading as item (item.book.id)}
							<div class="flex gap-4 border-b border-bd pb-6">
								<div
									class="relative flex h-48 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-bd bg-card-bg text-ink-20"
								>
									<span
										class="-rotate-[315deg] text-center font-serif text-[13px] leading-tight tracking-wide select-none"
										aria-hidden="true"
									>
										{item.book.title}
									</span>
									<img
										src={item.book.cover_url}
										srcset={getHardcoverSrcset(item.book.cover_url)}
										sizes="128px"
										alt={item.book.title}
										class="absolute inset-0 h-full w-full rounded-sm object-cover"
										loading="lazy"
										onerror={(e) => ((e.target as HTMLElement).style.opacity = '0')}
									/>
								</div>
								<div class="flex flex-1 flex-col justify-center">
									<div class="font-serif text-[20px] leading-tight text-ink-90">
										<a
											href="https://hardcover.app/books/{item.book.slug}?referrer_id=120657"
											target="_blank"
											rel="noopener noreferrer"
											class="text-inherit no-underline transition-colors duration-75 hover:text-ink-80"
										>
											{item.book.title}
										</a>
									</div>
									<div class="mt-1 font-mono text-[11px] tracking-wider text-ink-70">
										by {item.book.authors[0] ?? 'Unknown author'}, {item.book.release_year}
									</div>
									{#if item.progress}
										<div class="mt-3">
											<div class="h-[3px] w-full overflow-hidden rounded-full bg-rail">
												<div
													class="h-full rounded-full bg-prog transition-all duration-300"
													style="width: {item.progress.percentage}%"
												></div>
											</div>
											<div
												class="mt-3 flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-ink-70"
											>
												<span>{item.progress.pages_read} / {item.progress.total_pages} pages</span>
											</div>
										</div>
									{/if}
									<div class="mt-2 font-mono text-[11px] tracking-wider text-ink-70">
										Started: {formatDate(item.user_book.started_reading)}
										{#if item.last_read_event}
											&middot; Last read: {formatDateTime(item.last_read_event.action_at)}
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if previouslyRead.length > 0}
				<div class="mb-6">
					<div class="mb-6 font-sans text-[11px] tracking-[0.1em] text-ink-70 uppercase">
						Previously Read
					</div>
					<div class="space-y-6">
						{#each previouslyRead as item (item.book.id)}
							<div class="flex gap-4 border-b border-bd pb-6 last:border-0">
								<div
									class="relative flex h-48 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm border border-bd bg-card-bg text-ink-20"
								>
									<span
										class="-rotate-[315deg] text-center font-serif text-[13px] leading-tight tracking-wide select-none"
										aria-hidden="true"
									>
										{item.book.title}
									</span>
									<img
										src={item.book.cover_url}
										srcset={getHardcoverSrcset(item.book.cover_url)}
										sizes="128px"
										alt={item.book.title}
										class="absolute inset-0 h-full w-full rounded-sm object-cover"
										loading="lazy"
										onerror={(e) => ((e.target as HTMLElement).style.opacity = '0')}
									/>
								</div>
								<div class="flex flex-col justify-center">
									<div class="font-serif text-[20px] leading-tight text-ink-90">
										<a
											href="https://hardcover.app/books/{item.book.slug}?referrer_id=120657"
											target="_blank"
											rel="noopener noreferrer"
											class="text-inherit no-underline transition-colors duration-75 hover:text-ink-80"
										>
											{item.book.title}
										</a>
									</div>
									<div class="mt-1 font-mono text-[11px] tracking-wider text-ink-70">
										by {item.book.authors[0] ?? 'Unknown author'} &middot; {item.book.release_year}
									</div>
									<div class="mt-2 font-mono text-[11px] tracking-wider text-ink-70">
										{#if item.user_book.rating}
											<span class="text-[15px] text-ink-50"
												>{createStarRating(item.user_book.rating)}</span
											>
											<span class="text-bd">&middot;</span>
										{/if}
										<span>Finished: {formatDate(item.user_book.last_read_date)}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div class="mt-8 font-mono text-[11px] text-ink-70">data since 25/06/2026</div>
		{/if}

		<Footer />
	</main>
</div>

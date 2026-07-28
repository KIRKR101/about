<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { getMetaValue, getIiifSrcset } from '$lib/utils';
	import { computeVisualOrder } from '$lib/masonry';
	import { createRafObserver } from '$lib/raf-observer';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	interface ArtEntry {
		id: string;
		title: string;
		thumbnail: string;
		image: string;
		description: string;
		aspectRatio: string;
		data: [string, string][];
	}

	interface PageData {
		entries: ArtEntry[];
	}

	let { data }: { data: PageData } = $props();

	let lightboxActive = $state(false);
	let currentArtIndex = $state(0);
	let gridContainer = $state<HTMLElement | null>(null);

	const artEntries: [string, ArtEntry][] = data.entries.map((entry) => [entry.id, entry]);

	let shuffledEntries = $state<[string, ArtEntry][]>([...artEntries]);

	const cardEls = new SvelteMap<string, HTMLElement>();

	let visualOrder = $state<string[]>(artEntries.map(([id]) => id));

	let entriesWithMeta = $derived(
		shuffledEntries.map(([id, artwork]) => ({
			id,
			artwork,
			artist: getMetaValue(artwork.data, 'artist'),
			year: getMetaValue(artwork.data, 'year'),
			thumbnailSrcset: getIiifSrcset(artwork.thumbnail)
		}))
	);

	function updateVisualOrder() {
		if (cardEls.size === 0) return;

		const positions = [];
		for (const [id, el] of cardEls) {
			const rect = el.getBoundingClientRect();
			positions.push({ id, left: rect.left, top: rect.top });
		}

		visualOrder = computeVisualOrder(positions);
	}

	const rafObserver = createRafObserver(updateVisualOrder);

	function registerCard(id: string, el: HTMLElement) {
		cardEls.set(id, el);
		if (cardEls.size === shuffledEntries.length) {
			tick().then(updateVisualOrder);

			if (gridContainer) {
				rafObserver.observe(gridContainer);
			}
		}
	}

	function cardAction(el: HTMLElement, id: string) {
		registerCard(id, el);
		return {
			destroy() {
				cardEls.delete(id);
			}
		};
	}

	$effect(() => {
		shuffledEntries = [...artEntries].sort(() => Math.random() - 0.5);
		tick().then(updateVisualOrder);
	});

	$effect(() => {
		return () => {
			rafObserver.destroy();
		};
	});

	const openLightbox = (artId: string) => {
		const index = visualOrder.indexOf(artId);
		currentArtIndex = index >= 0 ? index : 0;
		lightboxActive = true;
	};

	const closeLightbox = () => (lightboxActive = false);
	const goToNext = () => (currentArtIndex = (currentArtIndex + 1) % visualOrder.length);
	const goToPrevious = () =>
		(currentArtIndex = (currentArtIndex - 1 + visualOrder.length) % visualOrder.length);

	function handleKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openLightbox(id);
		}
	}

	let currentArtData = $derived.by<ArtEntry | undefined>(() => {
		const id = visualOrder[currentArtIndex];
		if (!id) return undefined;
		return data.entries.find((entry) => entry.id === id);
	});

	let nextArtImageUrl = $derived.by<string | undefined>(() => {
		const nextId = visualOrder[(currentArtIndex + 1) % visualOrder.length];
		if (!nextId) return undefined;
		return data.entries.find((entry) => entry.id === nextId)?.image;
	});

	let prevArtImageUrl = $derived.by<string | undefined>(() => {
		const prevId = visualOrder[(currentArtIndex - 1 + visualOrder.length) % visualOrder.length];
		if (!prevId) return undefined;
		return data.entries.find((entry) => entry.id === prevId)?.image;
	});
</script>

<svelte:head>
	<title>Art | kirkr.xyz</title>
	<meta name="description" content="Artworks I like." />
	<link rel="preconnect" href="https://iiif.micr.io" crossorigin="anonymous" />
	<link rel="preconnect" href="https://upload.wikimedia.org" crossorigin="anonymous" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="w-full max-w-5xl">
		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Art</span><span class="opacity-20">.</span>
			</h1>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		<div bind:this={gridContainer} class="mb-12 columns-1 gap-12 py-2 sm:columns-2 lg:columns-3">
			{#each entriesWithMeta as entry (entry.id)}
				<button
					use:cardAction={entry.id}
					class="group mb-12 flex w-full break-inside-avoid flex-col text-left focus-visible:ring-1 focus-visible:ring-white/40"
					onclick={() => openLightbox(entry.id)}
					onkeydown={(e) => handleKeydown(e, entry.id)}
				>
					<div
						class="mb-6 w-full overflow-hidden border border-bd bg-neutral-900 shadow-2xl"
						style:aspect-ratio={entry.artwork.aspectRatio || 'auto'}
					>
						<img
							src={entry.artwork.thumbnail}
							srcset={entry.thumbnailSrcset || undefined}
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							alt={entry.artwork.title}
							class="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-102 group-hover:cursor-zoom-in group-hover:brightness-105"
							loading="lazy"
							decoding="async"
						/>
					</div>

					<span
						class="font-serif text-xl leading-tight text-white/90 transition-colors group-hover:text-white"
					>
						{entry.artwork.title}
					</span>

					<div class="mt-2 flex items-center gap-2">
						<span class="font-mono text-[11px] tracking-wider text-white/55">
							{entry.artist}
						</span>
						{#if entry.year}
							<span class="text-[10px] text-white/20">·</span>
							<span class="font-mono text-[11px] tracking-wider text-white/35">
								{entry.year}
							</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</main>
</div>

{#if lightboxActive && currentArtData}
	{@const artItem = currentArtData!}
	<Lightbox
		item={{
			...artItem,
			description: artItem.description,
			data: artItem.data as [string, string][]
		}}
		currentIndex={currentArtIndex}
		totalItems={visualOrder.length}
		nextUrl={nextArtImageUrl}
		prevUrl={prevArtImageUrl}
		onClose={closeLightbox}
		onNext={goToNext}
		onPrev={goToPrevious}
	/>
{/if}

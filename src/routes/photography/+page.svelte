<script lang="ts">
	import { photographyData } from '$lib/photography-list';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { computeVisualOrder } from '$lib/masonry';
	import { createRafObserver } from '$lib/raf-observer';
	import { tick, onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let lightboxActive = $state(false);
	let currentImageId = $state<string | null>(null);
	let gridContainer = $state<HTMLElement | null>(null);
	let contentContainer = $state<HTMLElement | null>(null);
	let navEl = $state<HTMLElement | null>(null);
	let navStyle = $state('position: fixed; visibility: hidden;');

	const cities = Object.keys(photographyData);
	let activeCity = $state(cities[0] ?? '');
	let sectionEls = new SvelteMap<string, HTMLElement>();

	const allImages = Object.entries(photographyData).flatMap(([city, images]) =>
		images.map((img) => ({ ...img, city }))
	);

	const cityById = new SvelteMap<string, string>();
	for (const img of allImages) {
		cityById.set(img.id, img.city);
	}

	const cardEls = new SvelteMap<string, HTMLElement>();
	let visualOrder = $state<string[]>(allImages.map((img) => img.id));

	let exifMap = $state<Record<string, [string, string][]> | null>(null);
	let exifLoadPromise: Promise<Record<string, [string, string][]>> | null = null;

	async function ensureExif() {
		if (exifMap) return exifMap;
		if (!exifLoadPromise) {
			exifLoadPromise = import('$lib/photography-exif').then((m) => {
				exifMap = m.photographyExif;
				return exifMap;
			});
		}
		return exifLoadPromise;
	}

	function updateVisualOrder() {
		if (cardEls.size === 0) return;

		const positions: { id: string; left: number; top: number }[] = [];
		for (const [id, el] of cardEls) {
			const rect = el.getBoundingClientRect();
			positions.push({ id, left: rect.left, top: rect.top });
		}

		const byCity = new SvelteMap<string, typeof positions>();
		for (const pos of positions) {
			const city = cityById.get(pos.id);
			if (!city) continue;
			if (!byCity.has(city)) byCity.set(city, []);
			byCity.get(city)!.push(pos);
		}

		const ordered: string[] = [];
		for (const city of Object.keys(photographyData)) {
			const cityPositions = byCity.get(city);
			if (cityPositions) {
				ordered.push(...computeVisualOrder(cityPositions));
			}
		}
		visualOrder = ordered;
	}

	const rafObserver = createRafObserver(updateVisualOrder);

	function registerCard(id: string, el: HTMLElement) {
		cardEls.set(id, el);
		if (cardEls.size === allImages.length) {
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

	function positionNav() {
		if (!contentContainer || !gridContainer) return;
		const containerRect = contentContainer.getBoundingClientRect();
		const gridRect = gridContainer.getBoundingClientRect();
		const navWidth = navEl?.offsetWidth ?? 176;
		const gap = 48; // matches gap-12
		const left = containerRect.left - gap - navWidth;
		navStyle = `position: fixed; top: ${gridRect.top}px; left: ${Math.max(16, left)}px; visibility: visible;`;
	}

	onMount(() => {
		positionNav();
		window.addEventListener('resize', positionNav);
		return () => window.removeEventListener('resize', positionNav);
	});

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeCity = entry.target.getAttribute('data-city') ?? activeCity;
					}
				}
			},
			{ rootMargin: '-10% 0px -80% 0px', threshold: 0 }
		);

		for (const [, el] of sectionEls) {
			observer.observe(el);
		}

		return () => {
			observer.disconnect();
		};
	});

	$effect(() => {
		return () => {
			rafObserver.destroy();
		};
	});

	function registerSection(el: HTMLElement, city: string) {
		sectionEls.set(city, el);
		return {
			destroy() {
				sectionEls.delete(city);
			}
		};
	}

	function goToCity(city: string) {
		const el = sectionEls.get(city);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	let currentImageIndex = $derived.by(() => {
		if (!currentImageId) return 0;
		return visualOrder.indexOf(currentImageId);
	});

	$effect(() => {
		if (lightboxActive && currentImageId && !visualOrder.includes(currentImageId)) {
			closeLightbox();
		}
	});

	const openLightbox = async (imageId: string) => {
		await ensureExif();
		currentImageId = imageId;
		lightboxActive = true;
	};

	const closeLightbox = () => {
		lightboxActive = false;
	};

	const goToNext = () => {
		if (currentImageIndex < 0) return;
		currentImageId = visualOrder[(currentImageIndex + 1) % visualOrder.length] ?? null;
	};

	const goToPrevious = () => {
		if (currentImageIndex < 0) return;
		currentImageId =
			visualOrder[(currentImageIndex - 1 + visualOrder.length) % visualOrder.length] ?? null;
	};

	let currentItem = $derived.by(() => {
		if (!currentImageId || currentImageIndex < 0) return undefined;
		const item = allImages.find((img) => img.id === currentImageId);
		if (!item) return undefined;
		return {
			...item,
			...(exifMap ? { exif: exifMap[currentImageId] } : {})
		};
	});

	let nextImageUrl = $derived.by<string | undefined>(() => {
		if (currentImageIndex < 0) return undefined;
		const id = visualOrder[(currentImageIndex + 1) % visualOrder.length];
		if (!id) return undefined;
		return allImages.find((img) => img.id === id)?.url;
	});

	let prevImageUrl = $derived.by<string | undefined>(() => {
		if (currentImageIndex < 0) return undefined;
		const id = visualOrder[(currentImageIndex - 1 + visualOrder.length) % visualOrder.length];
		if (!id) return undefined;
		return allImages.find((img) => img.id === id)?.url;
	});
</script>

<svelte:head>
	<title>Photography | kirkr.xyz</title>
	<meta name="description" content="A collection of photography from various cities." />
	<link rel="preconnect" href="https://res.cloudinary.com" crossorigin="anonymous" />
</svelte:head>

<div class="flex min-h-full flex-col items-center px-6 py-6 font-mono md:py-16">
	<div class="w-full max-w-7xl" bind:this={contentContainer}>
		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Photography</span><span class="opacity-20">.</span>
			</h1>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		<nav bind:this={navEl} style={navStyle} class="z-10 hidden w-44 shrink-0 xl:block">
			<ul class="flex flex-col gap-2">
			    {#each cities as city (city)}
					<li>
						<button
							class="w-full cursor-pointer rounded-sm px-2 py-1 text-left font-sans text-[15px] tracking-[0.05em] transition-colors duration-150 {activeCity ===
							city
								? 'text-white'
								: 'text-muted hover:text-white/60'}"
							onclick={() => goToCity(city)}
						>
							<span
								class="mr-2 inline-block transition-opacity duration-150 {activeCity === city
									? 'opacity-100'
									: 'opacity-0'}">&#x2022;</span
							>{city}
						</button>
					</li>
				{/each}
			</ul>
		</nav>

		<main class="min-w-0 flex-1">
			<div bind:this={gridContainer}>
				{#each Object.entries(photographyData) as [city, images] (city)}
					<section class="cv-auto mb-16 last:mb-0" data-city={city} use:registerSection={city}>
						<div class="mb-6 py-2">
							<h2 class="mb-1 font-serif text-[32px] leading-none text-white/80">{city}</h2>
						</div>

						<div class="columns-1 gap-4 sm:columns-2">
							{#each images as image (image.id)}
								<button
									class="group mb-4 w-full cursor-pointer break-inside-avoid overflow-hidden rounded-sm border border-bd bg-transparent p-0 text-left transition-all duration-75 focus-visible:ring-1 focus-visible:ring-white/40"
									use:cardAction={image.id}
									onclick={() => openLightbox(image.id)}
									aria-label={`View photo from ${city}`}
								>
									<img
										src={image.url}
										srcset={image.srcset}
										sizes="(max-width: 640px) 100vw, 50vw"
										alt={`Photo from ${city}`}
										style="aspect-ratio: {image.aspectRatio}"
										class="h-auto w-full object-cover transition-all duration-700 ease-out group-hover:scale-102 group-hover:cursor-zoom-in group-hover:brightness-105"
										loading="lazy"
										decoding="async"
										onload={() => updateVisualOrder()}
									/>
								</button>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		</main>
	</div>
</div>

{#if lightboxActive && currentItem}
	<Lightbox
		item={currentItem}
		currentIndex={currentImageIndex}
		totalItems={allImages.length}
		nextUrl={nextImageUrl}
		prevUrl={prevImageUrl}
		onClose={closeLightbox}
		onNext={goToNext}
		onPrev={goToPrevious}
	/>
{/if}

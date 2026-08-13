<script lang="ts">
	import { photographyData } from '$lib/photography-list';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { computeVisualOrder } from '$lib/masonry';
	import { createRafObserver } from '$lib/raf-observer';
	import { NavigationMenu } from 'bits-ui';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import Footer from '$lib/components/Footer.svelte';

	let lightboxActive = $state(false);
	let currentImageId = $state<string | null>(null);
	let gridContainer = $state<HTMLElement | null>(null);

	const allImages = Object.entries(photographyData).flatMap(([city, images]) =>
		images.map((img) => ({ ...img, city }))
	);

	const cityById = new SvelteMap<string, string>();
	for (const img of allImages) {
		cityById.set(img.id, img.city);
	}

	const cities = Object.keys(photographyData);
	const slugify = (city: string) => city.toLowerCase().replace(/\s+/g, '-');

	let activeCity = $state(cities[0] ?? '');
	const sectionEls = new SvelteMap<string, HTMLElement>();

	function sectionAction(el: HTMLElement, city: string) {
		sectionEls.set(city, el);
		return {
			destroy() {
				sectionEls.delete(city);
			}
		};
	}

	$effect(() => {
		if (sectionEls.size < cities.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				let best: Element | null = null;
				let bestTop = -Infinity;
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					if (entry.boundingClientRect.top > bestTop) {
						bestTop = entry.boundingClientRect.top;
						best = entry.target;
					}
				}
				if (best) {
					for (const [city, el] of sectionEls) {
						if (el === best) {
							activeCity = city;
							break;
						}
					}
				}
			},
			{ rootMargin: '-150px 0px -55% 0px' }
		);
		for (const el of sectionEls.values()) observer.observe(el);
		return () => observer.disconnect();
	});

	function scrollToCity(city: string, e: MouseEvent) {
		e.preventDefault();
		sectionEls.get(city)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

	$effect(() => {
		return () => {
			rafObserver.destroy();
		};
	});

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

<div class="flex min-h-screen flex-col items-center px-6 py-6 md:py-16">
	<div class="w-full max-w-5xl">
		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-ink">
				<span class="opacity-90">Photography</span><span class="opacity-40">.</span>
			</h1>
		</div>

		<nav class="sticky top-0 z-30 bg-bg">
			<div class="h-px bg-bd"></div>

			<NavigationMenu.Root aria-label="Photography sections" class="w-full">
				<NavigationMenu.List class="flex h-12 items-center gap-6 overflow-x-auto pl-2">
					{#each cities as city (city)}
						<NavigationMenu.Item value={city} class="h-full shrink-0">
							<NavigationMenu.Link
								href={`#${slugify(city)}`}
								active={activeCity === city}
								onclick={(e: MouseEvent) => scrollToCity(city, e)}
								class="relative flex h-full items-center font-sans text-[11px] tracking-[0.1em] whitespace-nowrap uppercase transition-colors duration-75 {activeCity ===
								city
									? 'text-ink-80'
									: 'text-ink-70 hover:text-ink'}"
							>
								<span class="relative">
									{city}
									<span
										class="absolute inset-x-0 -bottom-0.5 h-px bg-ink-80 transition-opacity duration-150 {activeCity ===
										city
											? 'opacity-100'
											: 'opacity-0'}"
									></span>
								</span>
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/each}
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</nav>

		<main class="min-w-0 flex-1 pt-8">
			<div bind:this={gridContainer}>
				{#each Object.entries(photographyData) as [city, images] (city)}
					<section
						id={slugify(city)}
						use:sectionAction={city}
						class="cv-auto mb-16 scroll-mt-[150px] last:mb-0 md:scroll-mt-[190px]"
					>
						<div class="mb-6 py-2">
							<h2 class="mb-1 font-serif text-[32px] leading-none text-ink-80">{city}</h2>
						</div>

						<div class="columns-1 gap-4 sm:columns-2">
							{#each images as image (image.id)}
								<button
									class="group mb-4 w-full cursor-pointer break-inside-avoid overflow-hidden rounded-sm border border-bd bg-transparent p-0 text-left transition-all duration-75"
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

		<Footer />
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

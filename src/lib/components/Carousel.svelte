<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';

	interface CarouselProps {
		images: string[];
		captions?: string[];
		height?: string;
	}

	let { images, captions = [], height = 'h-[320px] md:h-[400px]' }: CarouselProps = $props();

	let activeIndex = $state(0);
	let lightboxOpen = $state(false);

	let currentImage = $derived(images[activeIndex]!);
	let currentCaption = $derived(captions[activeIndex] ?? '');
	let currentAlt = $derived(currentCaption || `Image ${activeIndex + 1}`);

	let nextUrl = $derived.by(() => {
		if (images.length < 2) return undefined;
		return images[(activeIndex + 1) % images.length];
	});

	let prevUrl = $derived.by(() => {
		if (images.length < 2) return undefined;
		return images[(activeIndex - 1 + images.length) % images.length];
	});

	function goToNext() {
		if (images.length < 2) return;
		activeIndex = (activeIndex + 1) % images.length;
	}

	function goToPrevious() {
		if (images.length < 2) return;
		activeIndex = (activeIndex - 1 + images.length) % images.length;
	}

	function openLightbox() {
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}
</script>

{#if images.length > 0}
	<figure class="my-10">
		<div class="relative w-full overflow-hidden rounded-sm border border-bd bg-[#0d0d0e] {height}">
			<button
				class="group block h-full w-full cursor-zoom-in focus-visible:ring-1 focus-visible:ring-white/40"
				onclick={openLightbox}
				aria-label={`View image ${activeIndex + 1} in lightbox: ${currentCaption}`}
			>
				{#key activeIndex}
					<img
						class="m-0 h-full w-full object-contain transition-all duration-300 group-hover:brightness-105"
						src={currentImage}
						alt={currentAlt}
						loading="lazy"
						decoding="async"
					/>
				{/key}
			</button>

			{#if images.length > 1}
				<button
					class="absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-white transition-all duration-200 hover:bg-white/10 disabled:cursor-default disabled:opacity-40 md:h-11 md:w-11"
					onclick={goToPrevious}
					aria-label="Previous image"
				>
					<svg
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M15 18l-6-6 6-6" />
					</svg>
				</button>

				<button
					class="absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-white transition-all duration-200 hover:bg-white/10 disabled:cursor-default disabled:opacity-40 md:h-11 md:w-11"
					onclick={goToNext}
					aria-label="Next image"
				>
					<svg
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M9 18l6-6-6-6" />
					</svg>
				</button>

				<div
					class="absolute right-3 bottom-3 font-mono text-[10px] tracking-[0.18em] text-white/40 select-none"
				>
					{activeIndex + 1} / {images.length}
				</div>
			{/if}
		</div>

		{#if currentCaption}
			<figcaption
				class="mt-3 text-center font-mono text-[11px] leading-relaxed tracking-[0.02em] text-muted"
			>
				{currentCaption}
			</figcaption>
		{/if}
	</figure>
{/if}

{#if lightboxOpen}
	<Lightbox
		item={{ image: currentImage, title: currentCaption }}
		currentIndex={activeIndex}
		totalItems={images.length}
		{nextUrl}
		{prevUrl}
		onClose={closeLightbox}
		onNext={goToNext}
		onPrev={goToPrevious}
	/>
{/if}

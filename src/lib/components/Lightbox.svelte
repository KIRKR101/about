<script lang="ts">
	import { browser } from '$app/environment';

	interface LightboxProps {
		item: {
			url?: string;
			image?: string;
			title?: string;
			city?: string;
			description?: string;
			exif?: [string, string][];
			data?: [string, string][];
		};
		currentIndex: number;
		totalItems: number;
		nextUrl?: string | undefined;
		prevUrl?: string | undefined;
		onClose: () => void;
		onNext: () => void;
		onPrev: () => void;
	}

	let { item, currentIndex, totalItems, nextUrl, prevUrl, onClose, onNext, onPrev }: LightboxProps =
		$props();

	let mediaLoaded = $state(false);
	let isAnimating = $state(false);
	let isClosing = $state(false);
	let isMounted = $state(false);
	let footerVisible = $state(true);
	let dialogEl: HTMLDivElement | undefined = $state();
	let touchStartX: number | null = null;
	let touchStartY: number | null = null;
	let swipeTimestamp = 0;
	let previousFocus: HTMLElement | null = $state(null);
	let preloadLinks: string[] = [];

	function prefetchMedia(href: string | undefined) {
		if (!browser || !href) return;
		if (isVideoUrl(href)) return;
		if (preloadLinks.includes(href)) return;
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = href;
		link.setAttribute('data-lightbox-prefetch', '');
		document.head.appendChild(link);
		preloadLinks.push(href);
	}

	function cleanupPreloadLinks() {
		const links = document.head.querySelectorAll('link[data-lightbox-prefetch]');
		links.forEach((l) => l.remove());
		preloadLinks = [];
	}

	function trapFocus(e: KeyboardEvent) {
		if (e.key !== 'Tab' || !dialogEl) return;
		const focusable = Array.from(
			dialogEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		);
		if (focusable.length === 0) return;
		const first = focusable[0] as HTMLElement;
		const last = focusable[focusable.length - 1] as HTMLElement;
		if (e.shiftKey) {
			if (document.activeElement === first || document.activeElement === dialogEl) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	$effect(() => {
		if (browser) {
			prefetchMedia(nextUrl);
			prefetchMedia(prevUrl);
		}
	});

	function handleClose() {
		if (isClosing) return;
		isClosing = true;
		mediaLoaded = false;
		setTimeout(() => {
			onClose();
		}, 300);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') handleClose();
		if (e.key === 'ArrowRight' && totalItems > 1) handleNext();
		if (e.key === 'ArrowLeft' && totalItems > 1) handlePrev();
	}

	function handleNext() {
		if (isAnimating || isClosing) return;
		isAnimating = true;
		mediaLoaded = false;
		footerVisible = true;
		onNext();
		setTimeout(() => (isAnimating = false), 250);
	}

	function handlePrev() {
		if (isAnimating || isClosing) return;
		isAnimating = true;
		mediaLoaded = false;
		footerVisible = true;
		onPrev();
		setTimeout(() => (isAnimating = false), 250);
	}

	function toggleFooter() {
		if (Date.now() - swipeTimestamp < 300) return;
		footerVisible = !footerVisible;
	}

	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		if (touch) {
			touchStartX = touch.clientX;
			touchStartY = touch.clientY;
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (touchStartX === null || touchStartY === null) return;
		const touch = e.changedTouches[0];
		if (!touch) return;
		const touchEndX = touch.clientX;
		const touchEndY = touch.clientY;
		const diffX = touchEndX - touchStartX;
		const diffY = touchEndY - touchStartY;

		if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
			swipeTimestamp = Date.now();
			if (diffX > 0) {
				handlePrev();
			} else {
				handleNext();
			}
		}
		touchStartX = null;
		touchStartY = null;
	}

	function allKeydown(e: KeyboardEvent) {
		handleKeyDown(e);
		trapFocus(e);
	}

	$effect(() => {
		if (browser) {
			isMounted = true;
			previousFocus = document.activeElement as HTMLElement | null;
			window.addEventListener('keydown', allKeydown);

			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			if (scrollbarWidth > 0) {
				document.body.style.paddingRight = `${scrollbarWidth}px`;
			}
			document.body.style.overflow = 'hidden';

			dialogEl?.focus();
		}

		return () => {
			if (browser) {
				window.removeEventListener('keydown', allKeydown);

				document.body.style.overflow = '';
				document.body.style.paddingRight = '';

				cleanupPreloadLinks();
				previousFocus?.focus();
				previousFocus = null;
			}
		};
	});

	$effect(() => {
		if (item) mediaLoaded = false;
	});

	const imageUrl = $derived(item.url || item.image);
	function isVideoUrl(url: string | undefined) {
		if (!url) return false;
		return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
	}
	const metadata = $derived(item.exif || item.data);
	const title = $derived(item.title || item.city);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	bind:this={dialogEl}
	class="fixed inset-0 z-60 bg-[#0b0b0b]/95 transition-opacity duration-300 ease-in-out outline-none select-none {isMounted &&
	!isClosing
		? 'opacity-100'
		: 'opacity-0'}"
	onclick={(e) => {
		if (Date.now() - swipeTimestamp < 300) return;
		if (!(e.target as Element).closest('img, video, button, .text-container')) {
			handleClose();
		}
	}}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_60%)]"
	></div>

	<button
		class="absolute top-4 right-4 z-50 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 md:top-6 md:right-6 md:h-11 md:w-11"
		onclick={handleClose}
		aria-label="Close lightbox"
	>
		<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
			<path d="M18 6L6 18M6 6l12 12" />
		</svg>
	</button>

	{#if totalItems > 1}
		<button
			class="absolute top-1/2 left-3 z-50 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-100 md:left-6 md:h-14 md:w-14"
			onclick={handlePrev}
			disabled={isAnimating || isClosing}
			aria-label="Previous image"
		>
			<svg
				class="h-5 w-5 md:h-6 md:w-6"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</button>

		<button
			class="absolute top-1/2 right-3 z-50 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-100 md:right-6 md:h-14 md:w-14"
			onclick={handleNext}
			disabled={isAnimating || isClosing}
			aria-label="Next image"
		>
			<svg
				class="h-5 w-5 md:h-6 md:w-6"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M9 18l6-6-6-6" />
			</svg>
		</button>
	{/if}

	<div
		class="absolute inset-x-1 top-2 bottom-2 flex [touch-action:pinch-zoom] items-center justify-center"
		onclick={toggleFooter}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggleFooter();
			}
		}}
		role="button"
		tabindex="0"
		aria-label="Toggle image details"
	>
		{#if !mediaLoaded}
			<div
				class="absolute animate-pulse font-mono text-[10px] tracking-widest text-white/20 uppercase"
			>
				Loading
			</div>
		{/if}
		{#if isVideoUrl(imageUrl)}
			<video
				src={imageUrl}
				controls
				autoplay
				muted
				playsinline
				class="max-h-full max-w-full object-contain transition-all duration-300 {mediaLoaded
					? 'scale-100 opacity-100'
					: 'scale-[0.98] opacity-0'}"
				onloadeddata={() => (mediaLoaded = true)}
			></video>
		{:else}
			<img
				src={imageUrl}
				alt={title || ''}
				class="max-h-full max-w-full object-contain transition-all duration-300 {mediaLoaded
					? 'scale-100 opacity-100'
					: 'scale-[0.98] opacity-0'}"
				onload={() => (mediaLoaded = true)}
				draggable="false"
			/>
		{/if}
	</div>

	<div
		class="text-container pointer-events-none absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 pt-20 pb-6 transition-opacity duration-300 select-none md:px-6 md:pt-28 md:pb-8 {footerVisible
			? 'opacity-100'
			: 'opacity-0'}"
	>
		<div
			class="pointer-events-auto mx-auto w-full max-w-[780px] text-center {footerVisible
				? ''
				: '!pointer-events-none'}"
		>
			<div class="font-serif text-[22px] leading-tight tracking-tight text-white/95 md:text-[30px]">
				{title}
			</div>

			<div class="mt-2 font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase md:mt-3">
				{currentIndex + 1} / {totalItems}
			</div>

			{#if item.description}
				<p class="mt-4 font-sans text-[13px] leading-relaxed text-white/60 md:mt-6 md:text-[14px]">
					{item.description}
				</p>
			{/if}

			{#if metadata}
				<div class="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3 md:mt-7">
					{#each metadata as [key, value] (key)}
						<div class="font-mono text-[10px] whitespace-nowrap text-white/25 md:text-[11px]">
							{key}: <span class="text-white/50">{value}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

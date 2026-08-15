<script lang="ts">
	import { projects } from '$lib/projects-data';
	import { getContributionColor } from '$lib/utils';
	import Footer from '$lib/components/Footer.svelte';

	interface ContributionDay {
		date: string;
		contributionCount: number;
		color: string;
	}

	interface ContributionCalendar {
		totalContributions: number;
		weeks: { contributionDays: ContributionDay[] }[];
	}

	let graphContainer = $state<HTMLElement | null>(null);
	let isMobile = $state(false);
	let contributions = $state<ContributionCalendar | null>(null);
	let loading = $state(true);

	let touchStartX: number | null = null;
	let touchStartY: number | null = null;
	let touchStartTime = 0;

	let tooltip = $state<{ visible: boolean; date: string; count: number; x: number; y: number }>({
		visible: false,
		date: '',
		count: 0,
		x: 0,
		y: 0
	});

	let contributionWeeks = $derived(contributions?.weeks || []);
	let totalContributions = $derived(contributions?.totalContributions || 0);
	const currentYear = new Date().getFullYear();
	let selectedYear = $state(currentYear);

	const CACHE_TTL = 60 * 60 * 1000;

	function loadCache(): Record<number, ContributionCalendar> {
		try {
			const stored = localStorage.getItem('gh-contributions-cache');
			if (!stored) return {};
			const parsed = JSON.parse(stored);
			if (parsed && typeof parsed.timestamp === 'number' && typeof parsed.data === 'object') {
				if (Date.now() - parsed.timestamp > CACHE_TTL) {
					localStorage.removeItem('gh-contributions-cache');
					return {};
				}
				return parsed.data as Record<number, ContributionCalendar>;
			}
			return {};
		} catch {
			return {};
		}
	}

	function saveCache(cache: Record<number, ContributionCalendar>) {
		try {
			localStorage.setItem(
				'gh-contributions-cache',
				JSON.stringify({ data: cache, timestamp: Date.now() })
			);
		} catch {
			// localStorage not available
		}
	}

	const contributionsCache = loadCache();

	let currentFetch: AbortController | null = null;

	async function fetchContributions(year: number) {
		if (contributionsCache[year]) {
			contributions = contributionsCache[year];
			loading = false;
			return;
		}

		currentFetch?.abort();
		currentFetch = new AbortController();
		const signal = currentFetch.signal;

		loading = true;
		try {
			const url =
				year !== currentYear
					? `https://github.kirkr.xyz/?year=${year}`
					: 'https://github.kirkr.xyz/';
			const res = await fetch(url, { signal });
			if (!res.ok) return;
			const data = await res.json();
			contributionsCache[year] = data.contributions;
			saveCache(contributionsCache);
			contributions = data.contributions;
		} catch (e) {
			if (e instanceof DOMException && e.name === 'AbortError') return;
			console.error('Error fetching contributions:', e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		fetchContributions(selectedYear);
	});

	$effect(() => {
		isMobile = window.matchMedia('(max-width: 768px)').matches;
		const handleResize = () => {
			isMobile = window.matchMedia('(max-width: 768px)').matches;
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function formatContribDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function showTooltipFor(target: Element) {
		const parentRect = graphContainer?.getBoundingClientRect();
		if (!parentRect) return;
		const rect = target.getBoundingClientRect();
		const rawX = rect.left - parentRect.left + rect.width / 2;
		const clampedX = Math.max(50, Math.min(rawX, parentRect.width - 50));
		const day = target.getAttribute('data-day');
		const count = Number(target.getAttribute('data-count') ?? 0);
		if (!day) return;
		tooltip = {
			visible: true,
			date: formatContribDate(day),
			count,
			x: clampedX,
			y: rect.top - parentRect.top - 6
		};
	}

	function handleGraphMouseOver(e: MouseEvent) {
		if (isMobile) return;
		const target = (e.target as Element)?.closest?.('[data-day]');
		if (target) showTooltipFor(target);
	}

	function handleGraphMouseOut(e: MouseEvent) {
		if (isMobile) return;
		const related = e.relatedTarget as Element | null;
		if (!related || !related.closest?.('[data-day]')) {
			tooltip = { ...tooltip, visible: false };
		}
	}

	function handleGraphFocusIn(e: FocusEvent) {
		if (isMobile) return;
		const target = (e.target as Element)?.closest?.('[data-day]');
		if (target) showTooltipFor(target);
	}

	function handleGraphFocusOut(e: FocusEvent) {
		if (isMobile) return;
		const related = e.relatedTarget as Element | null;
		if (!related || !related.closest?.('[data-day]')) {
			tooltip = { ...tooltip, visible: false };
		}
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length > 1) return;
		const touch = e.touches[0];
		if (!touch) return;
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		touchStartTime = Date.now();
	}

	function handleTouchEnd(e: TouchEvent) {
		if (touchStartX === null || touchStartY === null) return;
		const touch = e.changedTouches[0];
		if (!touch) return;

		const elapsed = Date.now() - touchStartTime;
		if (elapsed > 300) {
			touchStartX = null;
			touchStartY = null;
			return;
		}

		const diffX = touch.clientX - touchStartX;
		const diffY = touch.clientY - touchStartY;

		if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
			if (diffX > 0) {
				if (selectedYear > 2024) selectedYear--;
			} else {
				if (selectedYear < currentYear) selectedYear++;
			}
		}
		touchStartX = null;
		touchStartY = null;
	}
</script>

<svelte:head>
	<title>Projects | kirkr.xyz</title>
	<meta name="description" content="Projects I've built." />
	<meta name="robots" content="index, follow" />
	<link rel="preconnect" href="https://github.kirkr.xyz" crossorigin="anonymous" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 md:py-16">
	<div class="w-full max-w-[600px]">
		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-ink">
				<span class="opacity-90">Projects</span><span class="opacity-40">.</span>
			</h1>
		</div>
	</div>

	<div class="h-px w-full max-w-[600px] bg-bd"></div>

	<div class="w-full max-w-[600px] py-7">
		<div class="mb-3 flex min-h-[16px] items-center justify-between">
			<div class="flex items-center">
				{#if loading}
					<div class="h-3 w-48 animate-pulse rounded-sm bg-ink/5"></div>
				{:else}
					<div class="font-sans text-[11px] tracking-wide text-ink-70">
						{totalContributions.toLocaleString()} contributions in {selectedYear}
					</div>
				{/if}
			</div>

			<div class="flex items-center p-0.5">
				<button
					class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-ink-70 transition-colors hover:bg-ink/10 hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-70"
					disabled={selectedYear <= 2024}
					onclick={() => selectedYear--}
					aria-label="Previous year"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
					>
				</button>
				<span class="w-10 text-center font-sans text-[11px] font-medium text-ink-70"
					>{selectedYear}</span
				>
				<button
					class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-ink-70 transition-colors hover:bg-ink/10 hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-70"
					disabled={selectedYear >= currentYear}
					onclick={() => selectedYear++}
					aria-label="Next year"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
					>
				</button>
			</div>
		</div>

		<div
			class="contribution-graph relative min-w-0 [touch-action:pan-y]"
			bind:this={graphContainer}
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
		>
			{#if tooltip.visible && !isMobile}
				<div
					class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
					style="left: {tooltip.x}px; top: {tooltip.y}px;"
				>
					<div
						class="rounded-sm bg-tooltip-bg px-1 py-1 text-[9px] whitespace-nowrap shadow-xl ring-1 ring-ink/20"
					>
						<span
							>{tooltip.count === 0
								? 'No contributions'
								: `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}</span
						>
						<span>on {tooltip.date}</span>
					</div>
				</div>
			{/if}

			<!-- svelte-ignore a11y_mouse_events_have_key_events -->
			<div
				class="grid w-full gap-[3px]"
				style="grid-template-columns: repeat({loading
					? 53
					: contributionWeeks.length}, minmax(0, 1fr));"
				role="grid"
				tabindex="-1"
				onmouseover={handleGraphMouseOver}
				onmouseout={handleGraphMouseOut}
				onfocusin={handleGraphFocusIn}
				onfocusout={handleGraphFocusOut}
			>
				{#if loading}
					{#each [...Array(53).keys()] as wi (wi)}
						<div class="grid grid-rows-7 gap-[3px]">
							{#each [...Array(7).keys()] as di (di)}
								<div class="aspect-square w-full animate-pulse rounded-sm bg-ink/5"></div>
							{/each}
						</div>
					{/each}
				{:else}
					{#each contributionWeeks as week, wi (week.contributionDays[0]?.date ?? `week-${wi}`)}
						<div class="grid grid-rows-7 gap-[3px]">
							{#each week.contributionDays as day (day.date)}
								<button
									class="relative aspect-square w-full cursor-default border-0 p-0 transition-all duration-75 sm:rounded-[3px] sm:hover:z-10 sm:hover:scale-110 sm:hover:brightness-125 sm:focus:z-10"
									style="background-color: {getContributionColor(day.contributionCount)}"
									data-day={day.date}
									data-count={day.contributionCount}
									tabindex={isMobile ? -1 : 0}
									aria-label="{day.contributionCount} contributions on {day.date}"
								></button>
							{/each}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<div class="h-px w-full max-w-[600px] bg-bd"></div>

	<main class="w-full max-w-[600px] pt-7">
		<div class="flex flex-col">
			{#each projects as project (project.title)}
				<a
					href={`/project/${project.id}`}
					class="group flex w-full flex-col rounded-sm border-b border-bd/30 py-3 no-underline transition-colors duration-100 ease-out last:border-0 hover:bg-ink/2 hover:duration-0 sm:px-1.5"
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

		<Footer />
	</main>
</div>

<script lang="ts">
	import { projects } from '$lib/projects-data';
	import { getContributionColor } from '$lib/utils';

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

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<div class="w-full max-w-[850px]">
		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Projects</span><span class="opacity-20">.</span>
			</h1>
		</div>
	</div>

	<div class="h-px w-full max-w-[850px] bg-bd"></div>

	<div class="w-full max-w-[850px] py-7">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<svg viewBox="0 0 16 16" class="h-4 w-4 fill-muted">
					<path
						fill-rule="evenodd"
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
					/>
				</svg>
				<span class="font-sans text-[11px] tracking-[0.1em] text-muted uppercase">Github</span>
			</div>
			<a
				href="https://github.com/Kirkr101"
				target="_blank"
				rel="noopener noreferrer"
				class="font-sans text-[10px] tracking-[0.15em] text-muted uppercase no-underline hover:text-white/60"
			>
				Kirkr101 ↗
			</a>
		</div>

		<div class="mb-3 flex min-h-[16px] items-center justify-between">
			<div class="flex items-center">
				{#if loading}
					<div class="h-3 w-48 animate-pulse rounded-sm bg-white/5"></div>
				{:else}
					<div class="font-sans text-[11px] tracking-[0.04em] text-muted">
						{totalContributions.toLocaleString()} contributions in {selectedYear}
					</div>
				{/if}
			</div>

			<div class="flex items-center p-0.5">
				<button
					class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-white/10 hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
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
				<span class="w-10 text-center font-sans text-[11px] font-medium text-muted"
					>{selectedYear}</span
				>
				<button
					class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-white/10 hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
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
						class="rounded-[4px] border border-muted/25 bg-[#1a1a1c] px-1.5 py-1.5 text-[11px] whitespace-nowrap shadow-xl ring-1 ring-black/40"
					>
						<span class="font-semibold text-white/90"
							>{tooltip.count === 0
								? 'No contributions'
								: `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}</span
						>
						<span class="text-white/45">on {tooltip.date}</span>
					</div>
					<div class="absolute top-full left-1/2 -translate-x-1/2">
						<div
							class="absolute -top-px left-1/2 h-0 w-0 -translate-x-1/2"
							style="border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #30363d;"
						></div>
						<div
							class="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2"
							style="border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #0d1117;"
						></div>
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
								<div class="aspect-square w-full animate-pulse rounded-[2px] bg-white/5"></div>
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

			<div class="mt-3 flex items-center justify-end gap-[3px]">
				<span class="mr-1 font-sans text-[10px] text-muted">Less</span>
				{#each [0, 3, 8, 15, 25] as count (count)}
					{#if loading}
						<div
							class="h-[10px] w-[10px] flex-shrink-0 animate-pulse rounded-[2px] bg-white/5"
						></div>
					{:else}
						<div
							class="h-[10px] w-[10px] flex-shrink-0 rounded-[2px]"
							style="background-color: {getContributionColor(count)}"
						></div>
					{/if}
				{/each}
				<span class="ml-1 font-sans text-[10px] text-muted">More</span>
			</div>
		</div>
	</div>

	<div class="h-px w-full max-w-[850px] bg-bd"></div>

	<main class="w-full max-w-[850px] py-7">
		<div class="flex flex-col">
			{#each projects as project (project.title)}
				<div class="group flex w-full flex-col border-b border-bd/30 py-4 last:border-0">
					<div class="flex w-full gap-6">
						<div class="min-w-0 flex-1">
							<a
								href={`/project/${project.id}`}
								class="font-sans text-[17px] text-white/70 transition-colors duration-100 group-hover:text-white hover:underline hover:decoration-white/70 hover:underline-offset-2"
							>
								{project.title}
							</a>
							{#if project.description}
								<p class="mt-1.5 line-clamp-2 font-sans text-[14px] leading-relaxed text-white/40">
									{project.description}
								</p>
							{/if}
						</div>
						<a
							href={project.link ?? project.github}
							target="_blank"
							rel="noopener noreferrer"
							class="shrink-0 font-mono text-[12px] tracking-wider text-muted/60 transition-colors duration-100 hover:text-white/85"
						>
							{project.link ? project.link.replace('https://', '') : 'github'} ↗
						</a>
					</div>
				</div>
			{/each}
		</div>
	</main>
</div>

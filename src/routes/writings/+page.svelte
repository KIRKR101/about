<script lang="ts">
	import { formatShortDate } from '$lib/utils';

	interface Writing {
		file: string;
		title: string;
		date: string;
		snippet?: string;
	}

	interface PageData {
		allWritings: Writing[];
	}

	let { data }: { data: PageData } = $props();

	let groupedWritings = $derived.by(() => {
		const groups: Record<string, Writing[]> = {};
		for (const writing of data.allWritings) {
			const year = new Date(writing.date).getFullYear().toString();
			(groups[year] ??= []).push(writing);
		}
		return Object.entries(groups)
			.map(([year, writings]) => ({ year, writings }))
			.sort((a, b) => b.year.localeCompare(a.year));
	});
</script>

<svelte:head>
	<title>Writings | kirkr.xyz</title>
	<meta name="description" content="Writings and articles on various topics." />
	<meta name="robots" content="index, follow" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-6 py-6 font-mono md:py-16">
	<main class="w-full max-w-[600px]">
		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white">
				<span class="opacity-90">Writings</span><span class="opacity-20">.</span>
			</h1>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		{#if data.allWritings.length === 0}
			<div class="py-12 text-center">
				<div class="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">
					No entries found
				</div>
			</div>
		{:else}
			<div class="flex flex-col gap-10">
				{#each groupedWritings as group (group.year)}
					<div class="flex flex-col">
						<h2 class="mb-3 font-mono text-[14px] text-white/40 uppercase">{group.year}</h2>

						<div class="flex flex-col">
							{#each group.writings as writing (writing.file)}
								<a
									href={`/writing/${writing.file}`}
									class="group flex w-full flex-col border-b border-bd/30 py-3 no-underline last:border-0"
								>
									<div class="flex w-full items-baseline justify-between">
										<span
											class="font-sans text-[14px] text-white/70 transition-colors duration-100 group-hover:text-white"
											>{writing.title}</span
										>
										<span class="shrink-0 font-mono text-[11px] tracking-wider text-muted/60"
											>{formatShortDate(writing.date)}</span
										>
									</div>
									{#if writing.snippet}
										<span
											class="mt-1 font-sans text-[12px] leading-relaxed text-white/40 line-clamp-2"
											>{writing.snippet}</span
										>
									{/if}
								</a>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

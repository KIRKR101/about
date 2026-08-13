<script lang="ts">
	import { formatDate } from '$lib/utils';
	import { externalLinks, footnoteBackref } from '$lib/actions';

	let { children, title, longTitle, date, snippet } = $props();
</script>

<svelte:head>
	<title>{title || 'Writing'} | kirkr.xyz</title>
	<meta name="description" content={snippet || 'Read writings and articles.'} />
</svelte:head>

<div class="flex min-h-0 flex-col items-center px-6 py-6 font-sans md:py-16">
	<main class="w-full max-w-[600px]">
		<div class="py-4">
			<a
				href="/writings"
				class="font-sans text-[11px] tracking-[0.1em] text-ink-70 uppercase no-underline hover:text-ink"
			>
				← all writings
			</a>
		</div>

		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-ink">
				{longTitle || title || 'Writing'}
			</h1>
			<div
				class="mt-3 flex items-center justify-between font-mono text-[11px] tracking-[0.1em] text-ink-70 uppercase"
			>
				<span>{formatDate(date)}</span>
			</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		<article
			use:externalLinks
			use:footnoteBackref
			class="prose prose-invert prose-sm sm:prose-base max-w-none font-sans text-ink-70"
		>
			{@render children()}
		</article>
	</main>
</div>

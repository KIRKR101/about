<script lang="ts">
	import { page } from '$app/stores';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>{$page.status} | kirkr.xyz</title>
</svelte:head>

<div
	class="flex min-h-full flex-col items-center justify-start px-6 pt-[20vh] pb-6 lg:pt-[24vh] lg:pb-16"
>
	<main class="w-full max-w-[600px] pl-6 md:pl-10">
		<div class="font-sans text-[11px] tracking-[0.1em] text-ink-70 uppercase">
			Error {$page.status}
		</div>
		<div class="mt-3 font-serif text-[26px] leading-tight text-ink-90 italic">
			{$page.error?.message || 'Page not found'}
		</div>
		<div class="mt-4 font-sans text-[14px] leading-[1.7] text-ink-70">
			The page you're looking for doesn't exist or has been moved.
		</div>
		<div class="mt-4 font-sans text-[14px] leading-[1.7] text-ink-70">
			Browse the site index at
			<a href="/llms.txt" class="underline transition-colors hover:text-ink">/llms.txt</a>
			or the full page list at
			<a href="/sitemap.xml" class="underline transition-colors hover:text-ink">/sitemap.xml</a>.
			The text of every page is also available as
			<a href="/llms-full.txt" class="underline transition-colors hover:text-ink">/llms-full.txt</a
			>.
		</div>
		<div class="mt-6">
			<a
				href="/"
				class="font-sans text-[11px] tracking-[0.1em] text-ink-70 uppercase no-underline transition-colors hover:text-ink"
			>
				Return home
			</a>
		</div>

		<Footer />
	</main>
</div>

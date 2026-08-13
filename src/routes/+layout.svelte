<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();

	let mainEl = $state<HTMLElement | null>(null);

	afterNavigate(() => {
		mainEl?.scrollTo(0, 0);
	});
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<meta name="description" content="Writing on computer engineering, and other interests." />
	<meta property="og:title" content="kirkr.xyz" />
	<meta property="og:description" content="Writing on computer engineering, and other interests." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://kirkr.xyz" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="kirkr.xyz" />
	<meta
		name="twitter:description"
		content="Writing on computer engineering, and other interests."
	/>
	<link rel="describedby" type="text/plain" href="/llms.txt" />
</svelte:head>

<a
	href="#main-content"
	class="fixed top-2 left-2 z-[999] -translate-y-20 rounded bg-ink px-4 py-2 font-sans text-[14px] text-bg no-underline transition-transform duration-200 focus:translate-y-0"
>
	Skip to content
</a>

<div class="flex h-dvh h-screen flex-col overflow-hidden bg-bg text-ink antialiased">
	<Navbar />
	<main
		bind:this={mainEl}
		id="main-content"
		class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
	>
		{@render children()}
	</main>
</div>

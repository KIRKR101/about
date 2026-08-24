<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();

	afterNavigate(() => {
		window.scrollTo(0, 0);
	});
</script>

<svelte:head>
	<title>kirkr.xyz</title>
	<meta name="description" content="Writing on computer engineering, and other interests." />
	<meta property="og:title" content="kirkr.xyz" />
	<meta property="og:description" content="Writing on computer engineering, and other interests." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://kirkr.xyz" />
	<meta property="og:image" content="https://kirkr.xyz/hero.webp" />
	<meta
		property="og:image:alt"
		content="Sketch of Landscape with Person on a Path by Anton Mauve"
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="kirkr.xyz" />
	<meta
		name="twitter:description"
		content="Writing on computer engineering, and other interests."
	/>
	<meta name="twitter:image" content="https://kirkr.xyz/hero.webp" />
	<link rel="describedby" type="text/plain" href="/llms.txt" />
</svelte:head>

<a
	href="#main-content"
	class="fixed top-2 left-2 z-[999] -translate-y-20 rounded bg-ink px-4 py-2 font-sans text-[14px] text-bg no-underline transition-transform duration-200 focus:translate-y-0"
>
	Skip to content
</a>

<div class="flex min-h-dvh flex-col bg-bg text-ink antialiased">
	<Navbar />
	<main id="main-content">
		{@render children()}
	</main>
</div>

<script lang="ts">
	import { formatDate } from '$lib/utils';

	let { children, title, longTitle, date, snippet } = $props();

	function externalLinks(node: HTMLElement) {
		const links = node.querySelectorAll('a');
		for (const link of links) {
			if (link.hostname && link.hostname !== window.location.hostname) {
				link.setAttribute('target', '_blank');
				link.setAttribute('rel', 'noreferrer noopener');
				const sr = document.createElement('span');
				sr.className = 'sr-only';
				sr.textContent = '(opens in new tab)';
				link.appendChild(sr);
			}
		}
	}

	function footnoteBackref(node: HTMLElement) {
		function onClick(e: Event) {
			const link = (e.target as Element).closest(
				'.footnote-backref, .data-footnote-backref, .footnote-ref'
			) as HTMLAnchorElement | null;
			if (!link) return;
			const href = link.getAttribute('href');
			if (!href?.startsWith('#')) return;
			const target = document.getElementById(href.slice(1));
			if (!target) return;
			const container = document.getElementById('main-content');
			if (!container) return;

			e.preventDefault();

			const cr = container.getBoundingClientRect();
			const tr = target.getBoundingClientRect();
			const isVisible = tr.top >= cr.top && tr.bottom <= cr.bottom;

			if (!isVisible) {
				const targetTop = tr.top - cr.top + container.scrollTop;
				container.scrollTo({ top: targetTop - 80, behavior: 'instant' });
			}

			history.replaceState(history.state, '', '#' + href.slice(1));

			const anim = target.id.startsWith('fnref-') ? 'fnref-flash' : 'fn-flash';
			target.style.animation = 'none';
			void target.offsetWidth;
			target.style.animation = `${anim} 2s ease-out forwards`;
		}
		node.addEventListener('click', onClick);
		return {
			destroy() {
				node.removeEventListener('click', onClick);
			}
		};
	}
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
				class="font-sans text-[11px] tracking-[0.1em] text-muted uppercase no-underline hover:text-white/60"
			>
				← all writings
			</a>
		</div>

		<div class="py-4">
			<h1 class="font-serif text-[48px] leading-tight tracking-[-1px] text-white/90">
				{longTitle || title || 'Writing'}
			</h1>
			<div
				class="mt-3 flex items-center justify-between font-mono text-[11px] tracking-[0.1em] text-muted uppercase"
			>
				<span>kirkr.xyz</span>
				<span>{formatDate(date)}</span>
			</div>
		</div>

		<div class="mb-8 h-px bg-bd"></div>

		<article
			use:externalLinks
			use:footnoteBackref
			class="prose prose-invert prose-sm sm:prose-base max-w-none font-sans text-[#c0c0c0]"
		>
			{@render children()}
		</article>
	</main>
</div>

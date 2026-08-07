export function externalLinks(node: HTMLElement) {
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

export function footnoteBackref(node: HTMLElement) {
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

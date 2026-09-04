import { defineMiddleware } from 'astro:middleware';

const PRODUCES = ['text/html', 'text/markdown'];

type AcceptEntry = { type: string; q: number; specificity: number };

function parseAccept(header: string): AcceptEntry[] {
	return header.split(',').map((raw) => {
		const parts = raw
			.trim()
			.split(';')
			.map((s) => s.trim());
		const type = parts[0]!.toLowerCase();
		let q = 1;
		for (const param of parts.slice(1)) {
			const [name, value] = param.split('=').map((s) => s.trim());
			if (name === 'q') {
				const parsed = Number(value);
				if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
			}
		}
		const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2;
		return { type, q, specificity };
	});
}

function matches(entry: AcceptEntry, candidate: string): boolean {
	if (entry.type === '*/*') return true;
	if (entry.type.endsWith('/*')) return candidate.startsWith(entry.type.slice(0, -1));
	return entry.type === candidate;
}

function preferredType(header: string | null): string | null {
	if (!header) return PRODUCES[0]!;
	const entries = parseAccept(header);
	if (entries.length === 0) return PRODUCES[0]!;

	let best: string | null = null;
	let bestQ = -1;
	let bestPosition = Infinity;

	for (const candidate of PRODUCES) {
		let matched: AcceptEntry | null = null;
		let matchedPosition = Infinity;
		for (let idx = 0; idx < entries.length; idx++) {
			const e = entries[idx]!;
			if (!matches(e, candidate)) continue;
			if (
				matched === null ||
				e.specificity > matched.specificity ||
				(e.specificity === matched.specificity && idx < matchedPosition)
			) {
				matched = e;
				matchedPosition = idx;
			}
		}
		if (matched === null) continue;
		const matchedQ: number = matched.q;
		if (matchedQ <= 0) continue;

		if (matchedQ > bestQ || (matchedQ === bestQ && matchedPosition < bestPosition)) {
			bestQ = matchedQ;
			bestPosition = matchedPosition;
			best = candidate;
		}
	}

	return best;
}

function appendVaryAccept(headers: Headers): void {
	const existing = headers.get('Vary');
	if (!existing) {
		headers.set('Vary', 'Accept');
		return;
	}
	const tokens = existing.split(',').map((s) => s.trim().toLowerCase());
	if (!tokens.includes('accept')) {
		headers.set('Vary', `${existing}, Accept`);
	}
}

export const onRequest = defineMiddleware(async (ctx, next) => {
	const raw = ctx.request.headers.get('accept');
	// Strict per RFC 9110: if client sends Accept but nothing we produce is acceptable (q>0), return 406
	if (raw !== null && raw.trim() !== '') {
		const chosen = preferredType(raw);
		if (chosen === null) {
			return new Response('Not Acceptable', {
				status: 406,
				headers: {
					Vary: 'Accept',
					'Content-Type': 'text/plain; charset=utf-8'
				}
			});
		}
		ctx.locals.prefersMarkdown = chosen === 'text/markdown';
	} else {
		ctx.locals.prefersMarkdown = false;
	}

	const response = await next();
	appendVaryAccept(response.headers);
	return response;
});

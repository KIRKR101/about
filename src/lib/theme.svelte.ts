export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function initialTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';
	return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function storedPreference(): Theme | null {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		if (value === 'light' || value === 'dark') return value;
	} catch {
		// localStorage not available
	}
	return null;
}

let current = $state<Theme>(initialTheme());

export function toggleTheme() {
	current = current === 'dark' ? 'light' : 'dark';
	document.documentElement.classList.toggle('dark', current === 'dark');
	try {
		localStorage.setItem(STORAGE_KEY, current);
	} catch {
		// localStorage not available
	}
}

if (typeof window !== 'undefined') {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		if (storedPreference()) return;
		current = e.matches ? 'dark' : 'light';
		document.documentElement.classList.toggle('dark', current === 'dark');
	});
}

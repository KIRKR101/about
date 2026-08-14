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

function applyThemeClass() {
	const root = document.documentElement;
	root.classList.add('theme-transition-off');
	root.classList.toggle('dark', current === 'dark');
	const release = () => root.classList.remove('theme-transition-off');
	requestAnimationFrame(() => requestAnimationFrame(release));
	setTimeout(release, 100);
}

export function toggleTheme() {
	current = current === 'dark' ? 'light' : 'dark';
	applyThemeClass();
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
		applyThemeClass();
	});
}

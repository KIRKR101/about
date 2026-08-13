<script lang="ts">
	import { toggleTheme } from '$lib/theme.svelte';
</script>

<footer class="pt-8">
	<div class="mb-4 h-px bg-bd"></div>
	<div class="flex items-center gap-5 text-[11px]">
		<a
			href="mailto:theo@kirkr.xyz"
			class="group inline-flex items-center gap-1 text-ink underline decoration-ink/20 underline-offset-2 transition-colors duration-100 hover:decoration-ink"
			>Email<svg
				width="14"
				height="14"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				class="text-ink-30 group-hover:text-ink-70"
				><path
					d="M12 10V4m0 0H6m6 0l-7.833 7.833"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				></path></svg
			></a
		>
		<a
			href="https://github.com/KIRKR101"
			target="_blank"
			rel="noopener noreferrer"
			class="group inline-flex items-center gap-1 text-ink underline decoration-ink/20 underline-offset-2 transition-colors duration-100 hover:decoration-ink"
			>Github<svg
				width="14"
				height="14"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				class="text-ink-30 group-hover:text-ink-70"
				><path
					d="M12 10V4m0 0H6m6 0l-7.833 7.833"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				></path></svg
			></a
		>
		<button
			type="button"
			class="group ml-auto inline-flex cursor-pointer items-center gap-1.5 text-ink transition-colors duration-100 hover:text-ink-80"
			onclick={() => toggleTheme()}
			aria-label="Toggle theme"
		>
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				class="text-ink-30 transition-colors duration-100 group-hover:text-ink-70 dark:hidden"
				><path
					d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				></path></svg
			>
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				class="hidden text-ink-30 transition-colors duration-100 group-hover:text-ink-70 dark:block"
				><circle cx="12" cy="12" r="4" fill="currentColor"></circle><path
					d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				></path></svg
			>
		</button>
	</div>
</footer>

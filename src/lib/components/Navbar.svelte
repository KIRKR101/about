<script lang="ts">
	import { page } from '$app/stores';
	import { fly, fade, slide } from 'svelte/transition';
	import { tick } from 'svelte';

	type NavLink = { name: string; path: string };
	type NavDropdown = { name: string; children: NavLink[] };
	type NavItem = NavLink | NavDropdown;

	function isDropdown(item: NavItem): item is NavDropdown {
		return 'children' in item;
	}

	let menuOpen = $state(false);
	let openDropdown = $state<string | null>(null);

	function isActive(path: string) {
		if (path === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(path);
	}

	const navItems: NavItem[] = [
		{ name: 'Writings', path: '/writings' },
		{ name: 'Projects', path: '/projects' },
		{
			name: 'Collections',
			children: [
				{ name: 'Films', path: '/films' },
				{ name: 'Books', path: '/books' },
				{ name: 'Art', path: '/art' },
				{ name: 'Photography', path: '/photography' }
			]
		}
	];

	function isChildActive(item: NavDropdown) {
		return item.children.some((child) => isActive(child.path));
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
		openDropdown = null;
	}

	function toggleDropdown(name: string) {
		openDropdown = openDropdown === name ? null : name;
	}

	function closeDropdowns() {
		openDropdown = null;
	}

	$effect(() => {
		if (!menuOpen) {
			document.body.style.overflow = '';
			return;
		}
		document.body.style.overflow = 'hidden';
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') closeMenu();
		}
		window.addEventListener('keydown', handleKeydown);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		if (menuOpen) return;
		openDropdown = null;
	});

	$effect(() => {
		if (openDropdown === null) return;
		function handleClickOutside(e: MouseEvent) {
			const target = e.target as Node;
			if (!(target as Element).closest?.('[data-dropdown]')) {
				closeDropdowns();
			}
		}
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<nav
	aria-label="Main navigation"
	class="relative z-50 h-16 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-sm"
>
	<div class="mx-auto h-full max-w-[1200px] px-4 md:px-6">
		<div class="flex h-full items-center justify-between">
			<div class="flex items-center">
				<a href="/" class="group focus:outline-none">
					<span
						class="font-serif text-[24px] leading-none tracking-[-1px] text-white md:text-[28px]"
					>
						<span class="opacity-90">kirkr</span><span class="opacity-20">.xyz</span>
					</span>
				</a>
			</div>

			<nav class="hidden h-full items-center gap-6 md:flex" aria-label="Desktop navigation">
				{#each navItems as item (item.name)}
					{#if isDropdown(item)}
						<div class="relative" data-dropdown>
							<button
								onclick={() => toggleDropdown(item.name)}
								onkeydown={(e: KeyboardEvent) => {
									if (e.key === 'ArrowDown' && openDropdown !== item.name) {
										e.preventDefault();
										openDropdown = item.name;
										tick().then(() => {
											const el = document.querySelector(
												`[data-dropdown="${item.name}"] a`
											) as HTMLElement | null;
											el?.focus();
										});
									}
								}}
								aria-expanded={openDropdown === item.name}
								aria-haspopup="menu"
								class="flex items-center gap-1 font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
							{isChildActive(item) ? 'text-white/80' : 'text-muted hover:text-white/60'}"
							>
								{item.name}
								<svg
									class="h-3 w-3 transition-transform duration-150 {openDropdown === item.name
										? 'rotate-180'
										: ''}"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							{#if openDropdown === item.name}
								<div
									role="menu"
									transition:slide={{ duration: 150 }}
									class="absolute top-full left-1/2 -translate-x-1/2 pt-2"
								>
									<div class="flex flex-col rounded-sm border border-bd bg-[#0a0a0b] shadow-xl">
										{#each item.children as child, i (child.path)}
											<a
												href={child.path}
												role="menuitem"
												onclick={closeDropdowns}
												onkeydown={(e: KeyboardEvent) => {
													if (e.key === 'ArrowDown') {
														e.preventDefault();
														const next = (e.target as HTMLElement).parentElement?.children[
															i + 1
														] as HTMLElement | undefined;
														next?.focus();
													} else if (e.key === 'ArrowUp') {
														e.preventDefault();
														if (i === 0) {
															closeDropdowns();
															(e.target as HTMLElement)
																.closest('[data-dropdown]')
																?.querySelector('button')
																?.focus();
														} else {
															const prev = (e.target as HTMLElement).parentElement?.children[
																i - 1
															] as HTMLElement | undefined;
															prev?.focus();
														}
													} else if (e.key === 'Escape') {
														e.preventDefault();
														closeDropdowns();
														(e.target as HTMLElement)
															.closest('[data-dropdown]')
															?.querySelector('button')
															?.focus();
													}
												}}
												class="block px-4 py-2 font-sans text-[11px] tracking-[0.1em] whitespace-nowrap uppercase transition-colors duration-75
											{isActive(child.path) ? 'text-white/80' : 'text-muted hover:bg-white/5 hover:text-white/60'}"
											>
												{child.name}
											</a>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<a
							href={item.path}
							class="font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
						{isActive(item.path) ? 'text-white/80' : 'text-muted hover:text-white/60'}"
						>
							{item.name}
						</a>
					{/if}
				{/each}
			</nav>

			<div class="flex items-center md:hidden">
				<button
					onclick={toggleMenu}
					class="flex h-10 w-10 items-center justify-center focus-visible:ring-1 focus-visible:ring-white/40"
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={menuOpen}
				>
					<svg
						class="h-6 w-6 text-white/70"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						{#if menuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							/>
						{/if}
					</svg>
				</button>
			</div>
		</div>
	</div>

	{#if menuOpen}
		<div
			transition:fly={{ y: -6, duration: 200 }}
			class="absolute top-16 right-0 left-0 rounded-b-sm border-b border-bd bg-[#0a0a0b] shadow-xl md:hidden"
		>
			<div class="flex flex-col">
				{#each navItems as item (item.name)}
					{#if isDropdown(item)}
						<div data-dropdown>
							<button
								onclick={() => toggleDropdown(item.name)}
								aria-expanded={openDropdown === item.name}
								aria-haspopup="menu"
								class="flex w-full items-center justify-between border-b border-bd/50 px-6 py-3 font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
							{isChildActive(item) ? 'text-white/80' : 'text-muted hover:bg-white/5 hover:text-white/60'}"
							>
								{item.name}
								<svg
									class="h-3 w-3 transition-transform duration-150 {openDropdown === item.name
										? 'rotate-180'
										: ''}"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							{#if openDropdown === item.name}
								<div role="menu" class="flex flex-col">
									{#each item.children as child (child.path)}
										<a
											href={child.path}
											role="menuitem"
											onclick={closeMenu}
											class="block border-b border-bd/50 py-2.5 pr-6 pl-10 font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
										{isActive(child.path) ? 'text-white/80' : 'text-muted hover:bg-white/5 hover:text-white/60'}"
										>
											{child.name}
										</a>
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<a
							href={item.path}
							onclick={closeMenu}
							class="block border-b border-bd/50 px-6 py-3 font-sans text-[11px] tracking-[0.1em] uppercase transition-colors duration-75
						{isActive(item.path)
								? 'bg-white/5 text-white/80'
								: 'text-muted hover:bg-white/5 hover:text-white/60'}"
						>
							{item.name}
						</a>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</nav>

{#if menuOpen}
	<div
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 top-16 z-40 backdrop-blur-[2px] md:hidden"
		onclick={closeMenu}
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				closeMenu();
			}
		}}
		aria-label="Close menu"
		role="button"
		tabindex="0"
	></div>
{/if}

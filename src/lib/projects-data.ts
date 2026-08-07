// Static projects data for client-side use
export const projects = [
	{
		id: 'wasmagick',
		title: 'WASMagick',
		link: 'https://wasmagick.kirkr.xyz',
		github: 'https://github.com/Kirkr101/wasmagick',
		description:
			'Run ImageMagick filters directly in the browser through WebAssembly. Everything is local: no servers, no uploads.',
		tech: ['Svelte 5', 'WebAssembly', 'TypeScript'],
		media: [
			'https://res.cloudinary.com/dvnkil9d4/image/upload/v1782515675/wasmagick_owgsva.webp',
			'https://res.cloudinary.com/dvnkil9d4/video/upload/v1782514387/wasmagick__ug5f2q.mp4'
		]
	},
	{
		id: 'audioshare-sv',
		title: 'Audioshare',
		link: null,
		github: 'https://github.com/Kirkr101/audioshare-sv',
		description:
			'Stream any audio format, including lossless, with automatic metadata and cover-art parsing. Built for sharing large music files.',
		tech: ['Svelte 5', 'TypeScript', 'Drizzle', 'SQLite'],
		media: [
			'https://res.cloudinary.com/dvnkil9d4/image/upload/v1782515675/audioshare1_z17tz0.webp',
			'https://res.cloudinary.com/dvnkil9d4/image/upload/v1782515675/audioshare2_n4wyrq.webp'
		]
	},
	{
		id: 'dezoomify-rs-jxl',
		title: 'Dezoomify-rs-jxl',
		link: null,
		github: 'https://github.com/Kirkr101/dezoomify-rs-jxl',
		description:
			'Download and stitch massive zoomable images from museum archives. Outputs JPEG XL with multithreaded encoding and colour profile preservation.',
		tech: ['Rust']
	},
	{
		id: 'voxor',
		title: 'Voxor',
		github: 'https://github.com/Kirkr101/Voxor',
		description:
			'Self-hosted chat with threading, typing indicators, LaTeX rendering, and a CMD+K quick-search modal.',
		tech: ['Python', 'Flask', 'JavaScript', 'Tailwind']
	},
	{
		id: 'cpusim',
		title: 'CPUsim',
		link: null,
		github: 'https://github.com/Kirkr101/CPUsim',
		description:
			'A 16-bit CPU emulator written from scratch, including a custom assembler and binary simulator. Handles arithmetic, stack ops, and function calls.',
		tech: ['C']
	},
	{
		id: 'streamline',
		title: 'Streamline',
		link: null,
		github: 'https://github.com/Kirkr101/Streamline',
		description:
			'Copy large folders across a local network without SFTP or Samba overhead. Zips, chunks, and transfers in parallel with SHA256 verification.',
		tech: ['Rust']
	},
	{
		id: 'linux-keylogger',
		title: 'Linux Keylogger',
		link: null,
		github: 'https://github.com/KIRKR101/linux_keylogger',
		description:
			'A minimal daemon that hooks Linux input device drivers to log keystrokes. Written as a low-level systems exercise.',
		tech: ['C']
	},
	{
		id: 'mini_malloc',
		title: 'Mini Malloc',
		link: null,
		github: 'https://github.com/Kirkr101/mini_malloc',
		description: 'A minimal memory allocator written in C as a learning exercise.',
		tech: ['C']
	},
	{
		id: 'open-gallery',
		title: 'Open Gallery',
		link: null,
		github: 'https://github.com/KIRKR101/open-gallery',
		description:
			"Browse the National Gallery's collection with full historical metadata, search, and filtering.",
		tech: ['Go', 'SQLite']
	},
	{
		id: 'rmt-debrid',
		title: 'RMT-Debrid',
		link: null,
		github: 'https://github.com/Kirkr101/RMT-Debrid',
		description:
			'Manage torrent downloads through Real-Debrid from a web dashboard, with real-time progress over WebSockets.',
		tech: ['Python', 'FastAPI', 'WebSocket']
	}
];

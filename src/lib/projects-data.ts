// Static projects data for client-side use
export const projects = [
	{
		id: 'wasmagick',
		title: 'WASMagick',
		link: 'https://wasmagick.kirkr.xyz',
		github: 'https://github.com/Kirkr101/wasmagick',
		description:
			'Run ImageMagick filters directly in the browser through WebAssembly. Everything is local: no servers, no uploads.',
		shortDescription: 'Browser-based ImageMagick',
		tech: ['Svelte', 'WebAssembly', 'TypeScript'],
		firstCommit: '10 Apr 2026',
		media: [
			'https://res.cloudinary.com/dvnkil9d4/image/upload/v1782515675/wasmagick_owgsva.webp',
			'https://res.cloudinary.com/dvnkil9d4/video/upload/v1782514387/wasmagick__ug5f2q.mp4'
		]
	},
	{
		id: 'lanx',
		title: 'Lanx',
		link: null,
		github: 'https://github.com/Kirkr101/lanx',
		description:
			'Transfer files and directories between machines over a local network.',
		shortDescription: 'LAN file transfer',
		tech: ['Rust', 'Tokio'],
		firstCommit: '19 Aug 2026',
	},
	{
		id: 'audioshare',
		title: 'Audioshare',
		link: null,
		github: 'https://github.com/Kirkr101/audioshare-sv',
		description:
			'Stream any audio format, including lossless, with automatic metadata and cover-art parsing. Built for sharing large music files.',
		shortDescription: 'Lossless audio sharing',
		tech: ['Svelte', 'TypeScript', 'Drizzle'],
		firstCommit: '25 May 2026',
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
		shortDescription: 'Tiled image downloader and stitcher',
		tech: ['Rust'],
		firstCommit: '24 May 2026'
	},
	{
		id: 'voxor',
		title: 'Voxor',
		github: 'https://github.com/Kirkr101/Voxor',
		description:
			'Self-hosted chat with threading, typing indicators, LaTeX rendering, and a CMD+K quick-search modal.',
		shortDescription: 'Self-hosted realtime chat',
		tech: ['Python', 'Flask', 'JavaScript'],
		firstCommit: '13 Oct 2024'
	},
	{
		id: 'cpusim',
		title: 'CPUsim',
		link: null,
		github: 'https://github.com/Kirkr101/CPUsim',
		description:
			'A 16-bit CPU emulator written from scratch, including a custom assembler and binary simulator. Handles arithmetic, stack ops, and function calls.',
		shortDescription: '16-bit CPU emulator',
		tech: ['C'],
		firstCommit: '19 Apr 2025'
	},
	{
		id: 'streamline',
		title: 'Streamline',
		link: null,
		github: 'https://github.com/Kirkr101/Streamline',
		description:
			'Copy large folders across a local network without SFTP or Samba overhead. Zips, chunks, and transfers in parallel with SHA256 verification.',
		shortDescription: 'Parallel local-network file transfer',
		tech: ['Rust'],
		firstCommit: '31 Aug 2024'
	},
	{
		id: 'linux-keylogger',
		title: 'Linux Keylogger',
		link: null,
		github: 'https://github.com/KIRKR101/linux_keylogger',
		description:
			'A minimal daemon that hooks Linux input device drivers to log keystrokes. Written as a low-level systems exercise.',
		shortDescription: 'Linux input-device logger',
		tech: ['C'],
		firstCommit: '15 May 2025'
	},
	{
		id: 'mini_malloc',
		title: 'Mini Malloc',
		link: null,
		github: 'https://github.com/Kirkr101/mini_malloc',
		description: 'A minimal memory allocator written in C as a learning exercise.',
		shortDescription: 'Minimal memory allocator',
		tech: ['C'],
		firstCommit: '23 Jun 2026'
	},
	{
		id: 'open-gallery',
		title: 'Open Gallery',
		link: null,
		github: 'https://github.com/KIRKR101/open-gallery',
		description:
			"Browse the National Gallery's collection with full historical metadata, search, and filtering.",
		shortDescription: 'National Gallery collection browser',
		tech: ['Go', 'SQLite'],
		firstCommit: '12 Oct 2025'
	},
	{
		id: 'rmt-debrid',
		title: 'RMT-Debrid',
		link: null,
		github: 'https://github.com/Kirkr101/RMT-Debrid',
		description:
			'Manage torrent downloads through Real-Debrid from a web dashboard, with real-time progress over WebSockets.',
		shortDescription: 'Real-Debrid torrent dashboard',
		tech: ['Python', 'FastAPI', 'WebSocket'],
		firstCommit: '24 Apr 2025'
	}
];

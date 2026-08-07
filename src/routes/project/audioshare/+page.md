---
layout: ProjectLayout
title: 'Audioshare'
description: 'Stream any audio format, including lossless, with automatic metadata and cover-art parsing. Built for sharing large music files.'
github: 'https://github.com/Kirkr101/audioshare-sv'
---

<script>
	import Carousel from '$lib/components/Carousel.svelte';
</script>

This site was mostly inspired by pillowcase.su, a music sharing platform mostly aimed towards leaks. I liked the idea for a music file sharing platform, so I built one myself.

The main aim was better performance and a more modern look and feel, combined with better discoverability and user experience.

For instance, I built a custom audio player that supports multiple audio formats and provides a seamless playback experience. Full metadata parsing and cover-art support are thoroughly implemented.

<Carousel
images={[
'https://res.cloudinary.com/dvnkil9d4/image/upload/v1782515675/audioshare1_z17tz0.webp',
'https://res.cloudinary.com/dvnkil9d4/image/upload/v1782515675/audioshare2_n4wyrq.webp',
'https://res.cloudinary.com/dvnkil9d4/image/upload/v1786101720/audioshare3_ruhxhi.webp'
]}
captions={[
'Home page - metadata parsing and cover-art support',
'Audio player - seamless playback and multiple audio formats',
'Metadata - parsed from audio files'
]}
height="h-[520px]"
/>

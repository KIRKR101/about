---
title: 'WASMagick'
description: 'Run ImageMagick filters directly in the browser through WebAssembly. Everything is local: no servers, no uploads.'
github: 'https://github.com/Kirkr101/wasmagick'
---

This was a project I started after developing a distdain for every publically-available tool. As somehow who knows how to use the command line, searching 'png to jpg' online feels like sacrilege, but that is the only thing that works in the browser.

Especially ones that simply do a server call and convert in the backend feel like a waste of resources. WASMagick does all the conversion in the browser, so you never have to leave the page, and your data stays local instead of being uploaded to one of those fishy sites.

The best way to achieve this goal was to use WebAssembly. Specifically, [magick-wasm](https://github.com/dlemstra/magick-wasm), a port of ImageMagick to WASM. There were some initial difficulties with implementing this library due to the lack of modern examples (and my lack of WASM familiarity), but once that was sorted out it was a pleasure to use.

There are a few caveats to this approach of course. For one, you are limited to the resources available to the browser, so processing large images may be slow or even impossible. Additionally, the WASM binary, about 10MB must be loaded first, so it has a slower initial load time than a native solution. The least important downside so far is the lack of parity with the native ImageMagick library. Though the list of features in the port is very wide, this could become a problem later on when I add new features. There is also an issue with upstream consistency -- as releases are usually a few weeks apart, bugs can stay for quite a while before being fixed. For instance, I found a [bug](https://github.com/ImageMagick/ImageMagick/issues/8901) in the JPEGXL C encoder, which was fixed within a day upstream but will take time to propagate to the WASM port.

Of course, there are plenty of good points to using WASM. For instance, ImageMagick supports the most formats and features -- compared to other image processing websites WASMagick can handle a wider range of formats without JS canvas tricks. The list of supported formats includes practically every format you can think of. Since a WASM binary is being used, it is easy to use locally and does not require any server-side setup; as long as you have visited the site before and it cached the resource, you can use it offline with all features.

I am personally not familiar with any online image editor with so many features, especially one that does not use HTML/JS canvas tricks.

<Carousel
images={[
'https://res.cloudinary.com/dvnkil9d4/image/upload/v1786106641/the-thinker-polaroid_d9ajfk.avif',
'https://res.cloudinary.com/dvnkil9d4/image/upload/v1786104793/the-thinker-noir_pidrmp.webp',
'https://res.cloudinary.com/dvnkil9d4/image/upload/v1786104792/the-thinker-poster_byhltz.avif',
'https://res.cloudinary.com/dvnkil9d4/image/upload/v1786105704/the-thinker-original_qr9qtq.webp'
]}
captions={[
'Instant Polaroid: Vintage CLUT, level colours black #40260d / white #ffe9c9, gamma 1.12 on all channels, 14px border in #faf3e7, Gaussian noise at attenuate 0.8, adaptive sharpen radius 1 / sigma 0.7, contrast 10, saturation 85%',
'Film Noir: Gray colour space, black threshold 8%, white threshold 95%, contrast 20, sharpen 1.5',
'Poster Print: sigmoidal contrast 5, brightness 80%, saturation 160%, auto level on, sharpen 2, quantize to 16 colours, Floyd–Steinberg dither, Oklab colour space, tree depth 4',
'The original for reference'
]}
height="h-[640px]"
/>

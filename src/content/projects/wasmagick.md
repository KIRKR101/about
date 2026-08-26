---
title: 'WASMagick'
description: 'Run ImageMagick filters directly in the browser through WebAssembly. Everything is local: no servers, no uploads.'
github: 'https://github.com/Kirkr101/wasmagick'
---

<script>
	import Carousel from '$lib/components/Carousel.svelte';
</script>

This was a project I started after developing a distdain for every publically-available tool. As somehow who knows how to use the command line, searching 'png to jpg' online feels like sacrilege, but that is the only thing that works in the browser.

Especially ones that simply do a server call and convert in the backend feel like a waste of resources. WASMagick does all the conversion in the browser, so you never have to leave the page, and your data stays local instead of being uploaded to one of those fishy sites.

The best way to achieve this goal was to use WebAssembly. Specifically, [magick-wasm](https://github.com/dlemstra/magick-wasm), a port of ImageMagick to WASM. There were some initial difficulties with implementing this library due to the lack of modern examples (and my lack of WASM familiarity), but once that was sorted out it was a pleasure to use.

There are a few caveats to this approach of course. For one, you are limited to the resources available to the browser, so processing large images may be slow or even impossible. Additionally, the WASM binary, about 10MB must be loaded first, so it has a slower initial load time than a native solution. The least important downside so far is the lack of parity with the native ImageMagick library. Though the list of features in the port is very wide, this could become a problem later on when I add new features. There is also an issue with upstream consistency -- as releases are usually a few weeks apart, bugs can stay for quite a while before being fixed. For instance, I found a [bug](https://github.com/ImageMagick/ImageMagick/issues/8901) in the JPEGXL C encoder, which was fixed within a day upstream but will take time to propagate to the WASM port.

Of course, there are plenty of good points to using WASM. For instance, ImageMagick supports the most formats and features -- compared to other image processing websites WASMagick can handle a wider range of formats without JS canvas tricks. The list of supported formats includes practically every format you can think of. Since a WASM binary is being used, it is easy to use locally and does not require any server-side setup; as long as you have visited the site before and it cached the resource, you can use it offline with all features.

I am personally not familiar with any online image editor with so many features:

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

### 1. Input / File Loading

- Drag & drop anywhere (global drop overlay)
- File picker / Browse (accepts image/\* + ~60 rare formats: raw camera, PDF, PS, XCF, PSD, EXR, DNG, JXL, HEIC, etc.)
- Paste image from clipboard (Ctrl+V)
- OS share-target support (mobile "share image" → editor via service worker + manifest.json share_target)
- Random sample images in the empty state
- 50 MB file-size limit with validation error
- Fast dimension sniffing (JPEG/PNG/GIF/WebP/BMP) before full decode
- Browser-preview capability probe: non-renderable formats (e.g. DNG) show a placeholder + warning, still process fine in WASM
- Unsaved-change confirmation guard before replace/close (staged ConfirmDialog)

### 2. Viewport & Preview

- Zoom (10–5000%), pan by drag, wheel zoom, pinch-zoom on touch, double-click toggles fit ↔ 100%
- Keyboard zoom/fit shortcuts; floating zoom toolbar (zoom %, in/out, fit, compare)
- Hold-to-compare before/after (Space) and split-wipe compare with draggable handle (B)
- Rotation badge overlay; loading pulse while processing; checkerboard transparency background
- Dark/light theme toggle (persisted, follows system preference)

### 3. Geometry

- Resize (W/H, auto-keep-aspect via single dimension)
- Rotate 0/90/180/270°, plus Flip (vertical) and Flop (horizontal)
- Auto Orient (EXIF orientation)
- Deskew / Trim: threshold slider, auto-crop toggle; trim boring borders toggle
- Crop two modes: visual drag-to-select on canvas (with aspect-ratio presets Free/1:1/4:3/3:2/16:9/9:16, position rect display, clear) and manual gravity-crop (W/H + 9-point gravity anchor)
- Shave pixels from edges (clamped)
- Canvas Extent (W/H + gravity + background colour picker)
- Border (size slider + colour picker)

### 4. colour & Tone

- Adjust: Brightness, Saturation, Hue sliders (modulate) + Contrast (brightness-contrast)
- Normalize, Auto Level, Auto Gamma toggles
- Levels: per-channel (All/Red/Green/Blue) black point / white point / gamma
- Level colours: black→white endpoint colours with optional Inverse, per channel
- Advanced colour: Threshold, Sigmoidal Contrast, Black/White Threshold, Auto Threshold (Kapur / OTSU / Triangle)
- CLAHE (X/Y tiles, histogram bins, clip limit)
- colour Space conversion: RGB, Gray, CMYK, HSL, HSV, Lab

### 5. Filters & Effects

- Effect presets: Grayscale, Sepia Tone, Charcoal Sketch, Negative, Canny Edge Detection (strength/lower/upper), Oil Paint, Solarize, Bilateral Blur
- Blur / Sharpen (radius)
- Adaptive Sharpen / Blur (radius + sigma)
- Advanced Blur: Gaussian (radius+sigma) and Motion Blur (radius, sigma, angle)
- Add Noise: Uniform, Gaussian, Multiplicative Gaussian, Impulse, Laplacian, Poisson with attenuate slider (Poisson inverted for consistent direction)
- colour LUT: 6 gradient presets (Warm, Cool, Vintage, High Contrast, Teal & Orange, Warm Mute) + interpolation method (Catrom, Bilinear, Nearest, Spline, Average)
- Quantize / Dithering: colour count, dither method (None/Riemersma/Floyd-Steinberg), colour space, tree depth

### 6. Annotation

- Text overlay with custom text input
- Fonts: 5 bundled (Roboto, Lato, PT Serif, Space Mono, Pacifico) + load system fonts via queryLocalFonts API (registered into the WASM engine)
- Font size, colour picker, 9-point gravity position, pixel X/Y offsets, rotation angle (-180..180)
- Stroke outline with width + colour

### 7. Export

- Formats: WebP, JPEG, PNG, AVIF, JXL, TIFF, GIF (JXL lossy noted as broken upstream in bundled IM 7.1.2-29)
- Quality slider (disabled for lossless formats)
- Strip Metadata toggle
- EXIF viewer: lazy ExifTool-WASM extraction; priority tags (Make, Model, lens, exposure, ISO, GPS, etc.) with show-more for all fields
- Output preview: dimensions, format, process time, file size (KB + % delta vs original)
- Download as name-edited.ext; marks history entry saved; Ctrl+S
- Persists last format/quality in localStorage

### 8. Presets

- 7 built-in one-click presets: Web Shrink, Thumbnail, B&W Photo, Sepia Vintage, Sharpen Scan, Social Square, HQ PNG
- User presets: save current settings by name, apply, delete — persisted to localStorage (wasmagick.presets.v1)
- Active-preset detection (highlight when settings match)

### 9. History / Undo-Redo

- 40-entry undo/redo stack with instant restore (settings + blob URL snapshots)
- Keyboard Ctrl+Z / Ctrl+Shift+Z, toolbar + history panel controls
- History list with thumbnails, per-entry process time, dims, format, size
- Per-entry settings diff ("Since last" / "From original" modes), jump-to-any-state, clear (with confirm)

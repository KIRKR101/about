---
layout: ProjectLayout
title: 'Dezoomify-rs-jxl'
description: 'Download and stitch massive zoomable images from museum archives. Outputs JPEG XL with multithreaded encoding and colour profile preservation.'
github: 'https://github.com/Kirkr101/dezoomify-rs-jxl'
---

Some websites, for example museums who work against their own interest, present high-resolution zoomable images without giving you a way to download them. They split the image into tiles and reassemble it by JavaScript in the browser. Dezoomify solves this by automating the process of downloading every tile, stitching them back together, and saving the full-resolution image.

This project is a fork of [dezoomify-rs](https://github.com/lovasoa/dezoomify-rs), which I picked because the original cannot output JPEG XL, which is very efficient for high-resolution images, and importantly can store much higher resolutions -- JPG can store up to 65,535 × 65,535 px (16-bit dimension fields in the SOF marker), whereas JPEG XL can store up to 1,073,741,823 × 1,073,741,823 px (up to 30-bit dimension fields).

The main addition of course is JPEG XL output. I was enlightened to the joys of JXL after reading a [technical overview](https://arxiv.org/pdf/2506.05987). JXL gives much better compression than PNG or JPEG at the same quality, which matters hugely when you have multi-gigapixel scans of a painting. It also supports both lossless and lossy compression in a single codec, so you don't need a bloated PNG for archival-quality. Encoding runs multithreaded, and the encoder streams output directly to disk rather than buffering the whole image in memory, so it can handle images that would otherwise exhaust available RAM. The format also supports progressive decoding, so a usable preview can be pulled from a partial file without decoding the whole multi-gigapixel image. The encoder also transfers the ICC colour profile from the source tiles to the output, meaning it can preserve accurate colour reproduction, and JXL's support for high bit depth and wide colour gamuts means no fidelity is lost in the process.

Above just adding JXL, I integrated the jpegxl-rs library, improved tests all around, added JXL ICC support via direct jpegxl-sys FFI wrapper, used multi-threading encoding, implemented JXL specific --effort, added concurrency via a CPU-bounded decode semaphore, cancellation-aware public APIs, atomic output reservation, and modernised error handling. And I am still working on this.

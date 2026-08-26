---
title: 'Mini Malloc'
description: 'A minimal memory allocator written in C as a learning exercise.'
github: 'https://github.com/Kirkr101/mini_malloc'
---

I was familiar with the basics but was in the dark about how memory allocators work under the hood, so I decided to write my own. Mini Malloc is a from-scratch `mini_malloc` / `mini_free` written in C, roughly implemented the way a real allocator would be.

The project follows a test-first structure. Claude wrote the test suite (a hand-rolled harness with a small `ASSERT` macro); I wrote the full implementation. The tests gate progress: the allocator starts as a stub, and the workflow is to work through a roadmap, making one test pass at a time until `make test` reports zero failures. Each test file covers a single concern, so the allocator grows in coherent layers rather than all at once.

The public API is just the two functions every allocator needs: `mini_malloc(size)` and `mini_free(ptr)`. Because the implementation is linked with a name remap, it can optionally stand in for libc's `malloc` and `free`, which makes it possible to run real programs against it and catch bugs a unit test would miss.

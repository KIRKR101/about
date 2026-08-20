---
layout: ProjectLayout
title: 'Lanx'
description: 'Transfer files and directories between machines over a local network.'
github: 'https://github.com/Kirkr101/lanx'
---

Lanx is my attempt to fix Streamline, an earlier, more limited and janky project, improving on its shortcomings wherever possible.

It's a program for sending a file or a whole directory from one computer to another on the same local network. The sender picks a random network port; the receiver connects and pulls the data from it. Because the receiver initiates the connection, there's no need to configure ports on the receiving side.

The two computers find each other via a pairing code, which identifies both sides as part of the same transfer session. By default, the program auto-discovers peers on the local network via broadcast, but falls back to manually entering an IP address and port if needed (auto-discovery can also be disabled).

Transfers are reliable and efficient: they resume from where they left off using Blake3 hash-chain fingerprinting, tracked via a small file that records progress as a set of hashes. Existing files on the target are skipped; corrupted or partial files have only the missing part re-fetched, not the whole file. Directory listings are streamed via a generator rather than loaded into memory, so large listings are handled gracefully.

Multiple files can be sent in parallel over several connections, with the number of connections agreed at the start of the transfer.

Transfers are end-to-end encrypted using the Noise protocol with X25519 key exchange and ChaChaPoly AEAD, so only sender and receiver can see file contents. An optional relay server can help with networking issues; it only passes along encrypted bytes.

Other features include optional ZIP bundling before sending; an interactive preview before transfer starts (refuses to run non-interactively, for safety); automatic reconnection with increasing back-off (or infinite retries, if set); live per-file progress with speed; and an end-of-transfer summary of successes, failures/re-fetches, and skips. It runs on Windows, macOS, and Linux with a common cross-platform path format, blocks path-traversal attempts, and enforces limits on file count, chunk size, and frame size to prevent denial-of-service. Output automatically falls back to plain text when colour or Unicode isn't supported (e.g., when piped).

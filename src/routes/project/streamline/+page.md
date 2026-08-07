---
layout: ProjectLayout
title: 'Streamline'
description: 'Copy large folders across a local network without SFTP or Samba overhead. Zips, chunks, and transfers in parallel with SHA256 verification.'
github: 'https://github.com/Kirkr101/Streamline'
---

Streamline is a plain-TCP file transfer tool written in Rust that skips the burden of SFTP or Samba. It zips directories, chunks the data, and sends chunks over parallel connections, verifying everything with SHA-256.

If the network drops mid-copy, the server keeps a partial file and its metadata, and the client picks up from the last offset rather than starting over.

Beyond the core transfer, there are a few conveniences: mDNS discovery finds servers on the LAN with zero configuration, an address book saves named peers so you can `streamline client my-laptop ...` instead of typing addresses, and a system tray keeps a server running quietly in the background. Right-click any file and "Send with Streamline" works through OS shell integration.

Transfers can be configured for chunk size and parallelism, and the receiver can require manual acceptance of each incoming transfer or trust certain peers to auto-accept. It runs on Windows, Linux, and macOS. It is not encrypted, so it is meant for a trusted network - but for that use case it is dramatically faster and simpler than the alternatives. It was a fun exercise in networking too.

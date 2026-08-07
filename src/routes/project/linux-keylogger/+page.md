---
layout: ProjectLayout
title: 'Linux Keylogger'
description: 'A minimal daemon that hooks Linux input device drivers to log keystrokes. Written as a low-level systems exercise.'
github: 'https://github.com/KIRKR101/linux_keylogger'
---

A keylogger is a small, self-contained project that forces you to touch real low-level systems code. Linux exposes input devices through character devices under `/dev/input`, and a daemon can read the raw event stream directly from them without any kernel modules.

This is intentionally minimal for obvious reasons. It opens the input device driver, reads the event queue, filters for key events, and appends them to a log file. It runs as a background daemon, but requires `sudo` because reading the raw input devices requires root.

Written in C as a systems exercise, I touched on file descriptors, low-level I/O, and the event API in a way that is easy to inspect end to end.

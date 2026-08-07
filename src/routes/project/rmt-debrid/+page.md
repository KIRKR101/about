---
layout: ProjectLayout
title: 'RMT-Debrid'
description: 'Manage torrent downloads through Real-Debrid from a web dashboard, with real-time progress over WebSockets.'
github: 'https://github.com/Kirkr101/RMT-Debrid'
---

Real-Debrid is great until you want to run it from your own machine. There is no convenient interface for sending it a magnet, watching the torrent resolve, and pulling the finished file down locally. RMT-Debrid is a web dashboard that does all that, using FastAPI and WebSockets.

You paste a direct HTTP(S) link or a `magnet:` URI, and the dashboard hands it to Real-Debrid, which unrestricts or processes it. Once the torrent is ready, the file downloads directly to the host machine running the app. The WebSocket connection keeps the status, progress, speed, and ETA updating in real time for both the Real-Debrid processing stage and the local download stage, so there is no polling and no stale numbers.

Downloads can be paused, resumed, cancelled, or cleared from the list, and the interface shows basic Real-Debrid account information alongside the transfers. Everything runs against a `.env` with just the API key and a download path.

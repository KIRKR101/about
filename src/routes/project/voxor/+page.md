---
layout: ProjectLayout
title: 'Voxor'
description: 'Self-hosted chat with threading, typing indicators, LaTeX rendering, and a CMD+K quick-search modal.'
github: 'https://github.com/Kirkr101/Voxor'
---

Voxor is a self-hosted chat application built with Flask on the backend and vanilla JavaScript with Tailwind on the frontend. It was an exercise in building real-time interactions without using a heavy framework.

I tried to make it close to Discord or slack - conversations are organised into threads, and messages in a thread update live, with typing indicators shown while someone is composing. Messages can include LaTeX, which is rendered inline so formulas read as naturally as text, markdown can also be rendered.

It also features a CMD+K quick-search modal jumps you to a conversation without leaving the keyboard, and the whole interface is styled to be light and fast.

Because it is self-hosted, everything runs on your own machine and your own network. There is no third-party server in the middle, no account required beyond your own instance, and the data stays where you put it.

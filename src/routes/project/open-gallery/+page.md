---
layout: ProjectLayout
title: 'Open Gallery'
description: "Browse the National Gallery's collection with full historical metadata, search, and filtering."
github: 'https://github.com/KIRKR101/open-gallery'
---

Open Gallery is a Go web application for browsing and managing an art collection, built around the National Gallery's data. The point was to make a large, metadata-heavy collection browsable rather than just listed.

Search covers artist names, artwork titles, and keywords, and filtering narrows the collection by artist, century, or featured status. Browsing uses pagination with infinite scroll, and each artwork has its own detail page with full historical metadata: dimensions, medium, exhibition history, bibliography, provenance, and acquisition information. Featured artworks get a curated, randomised showcase.

Under the hood it is a single Go binary serving HTML templates against a SQLite database, with Python scripts used to gather metadata from HTML pages on the National Gallery's website and process images into the collection. There is also an administrative interface for managing the collection, toggling featured status, and running the same search and filtering from the admin side.

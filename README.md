A personal website built with Astro + vanilla JS (migrated from SvelteKit), with GitHub and Spotify proxies through Cloudflare Workers.

Personal site, experiments, and things I’m making.

## Switching domains

The site's domain is a single knob: set `SITE_DOMAIN` in `site.config.mjs`. The URL, sitemap, canonical/OG metadata, page titles, markdown exports, and `llms-full.txt` all derive from it.

`SITE_EMAIL` (`theo@kirkr.xyz`) is intentionally **independent** of the site domain — it must keep working when the website moves. Change it separately, in the same file, only if the mail domain changes.

API subdomains (`github.`, `spotify.`, `lastfm.`) are separate Worker deployments and are also not derived from the site domain, but their URLs are centralised as `GITHUB_API_BASE`, `SPOTIFY_API_URL`, and `LASTFM_API_URL` in the same file — all consumers import them from `src/lib/site.ts`. After a migration, regenerate `static/llms.txt` (crawled snapshot) and check `static/llms-full.txt` and the generated sitemap for old-domain references.

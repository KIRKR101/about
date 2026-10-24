// Re-exports the site identity from /site.config.mjs at the repo root, so all
// src code imports from here. To switch domains, edit site.config.mjs only.
export {
	SITE_DOMAIN,
	SITE_URL,
	SITE_EMAIL,
	GITHUB_API_BASE,
	SPOTIFY_API_URL,
	LASTFM_API_URL
} from '../../site.config.mjs';

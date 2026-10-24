// Single source of truth for the site's identity.
//
// To switch domains, change SITE_DOMAIN and everything else follows: URL,
// sitemap, page titles, metadata, markdown exports, and the generated
// llms-full.txt.
//
// Deliberately NOT derived from the domain:
//   - SITE_EMAIL. Email lives on its own domain and should keep working when
//     the website moves. Change it separately if the mail domain ever changes.
//   - API subdomains below (github., spotify., lastfm.). These are separate
//     deployments, so the API calls keep working the same no matter what the
//     site domain is.
//   - Project subdomains (e.g. wasmagick.) in src/lib/projects-data.ts.

/** The bare domain the site is served from. */
export const SITE_DOMAIN = 'theokirk.com';

/** Absolute origin built from the domain. */
export const SITE_URL = `https://${SITE_DOMAIN}`;

/**
 * Contact email — a literal on its own domain, independent of SITE_DOMAIN.
 * Do NOT derive this from SITE_DOMAIN: moving the website to another domain
 * must not change the email address.
 */
export const SITE_EMAIL = 'theo@kirkr.xyz';

// API endpoints — independent deployments, intentionally kept off SITE_DOMAIN.
export const GITHUB_API_BASE = 'https://github.kirkr.xyz';
export const SPOTIFY_API_URL = 'https://spotify.kirkr.xyz/api/now-playing';
export const LASTFM_API_URL = 'https://lastfm.kirkr.xyz/api/lastfm-track';

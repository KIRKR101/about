export async function onRequest(context) {
    try {
        const API_KEY = context.env.LASTFM_API_KEY;

        const USERNAME = "Kirkr101";

        if (!API_KEY) {
            console.error("LASTFM_API_KEY environment variable not set!");
            return new Response(
                JSON.stringify({
                    error: "API key not configured on the server.",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const API_URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`;

        const response = await fetch(API_URL, {
            headers: {
                "User-Agent": "kirkr.xyz-website/1.0",
            },
        });

        if (!response.ok) {
            throw new Error(
                `Last.fm API responded with status: ${response.status}`
            );
        }

        const data = await response.json();

        const track = data.recenttracks.track[0];
        if (!track) {
            return new Response(
                JSON.stringify({
                    error: "No tracks found.",
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const isNowPlaying = track["@attr"] && track["@attr"].nowplaying === "true";

        const responseBody = {
            status: isNowPlaying ? "Currently playing" : "Last Listen",
            title: track.name,
            artist: track.artist["#text"],
            albumArt: track.image.find((img) => img.size === "large")["#text"],
            trackUrl: track.url,
        };

        return new Response(JSON.stringify(responseBody), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control":
                    "public, s-maxage=60, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error("Error executing function:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

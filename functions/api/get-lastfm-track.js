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

        return new Response(JSON.stringify(data), {
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

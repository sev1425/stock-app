export default async function handler(req, res) {
    try {
        const token = process.env.FINNHUB_API_KEY;
        if (!token) throw new Error("Missing FINNHUB_API_KEY");

        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${token}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            return res.status(200).json([]);
        }

        const news = data.slice(0, 5).map(n => ({
            id: n.id,
            headline: n.headline,
            url: n.url,
            source: n.source || 'Finnhub',
            summary: n.summary,
            datetime: n.datetime
        }));
        res.status(200).json(news);
    } catch {
        res.status(502).json({ error: "Failed to fetch news" });
    }
}

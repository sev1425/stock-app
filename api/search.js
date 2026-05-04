export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);
    try {
        const token = process.env.FINNHUB_API_KEY;
        if (!token) throw new Error("Missing FINNHUB_API_KEY");

        const response = await fetch(`https://finnhub.io/api/v1/search?q=${q}&token=${token}`);
        const data = await response.json();

        if (!data || !data.result) {
            return res.status(200).json([]);
        }

        const results = data.result.slice(0, 5).map(quote => ({
            symbol: quote.symbol,
            description: quote.description || quote.symbol,
            type: quote.type
        }));
        res.status(200).json(results);
    } catch {
        res.status(502).json({ error: "Failed to search" });
    }
}

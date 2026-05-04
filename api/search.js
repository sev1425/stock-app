import YahooFinanceLib from 'yahoo-finance2';
const yahooFinance = new YahooFinanceLib();
yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);
    try {
        const query = await yahooFinance.search(q);
        const results = query.quotes.slice(0, 5).map(quote => ({
            symbol: quote.symbol,
            description: quote.shortname || quote.longname || quote.symbol,
            type: quote.quoteType
        }));
        res.status(200).json(results);
    } catch {
        res.status(502).json({ error: "Failed to search" });
    }
}

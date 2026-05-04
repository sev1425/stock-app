import YahooFinanceLib from 'yahoo-finance2';
const yahooFinance = new YahooFinanceLib();
yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

export default async function handler(req, res) {
    try {
        const query = await yahooFinance.search('AAPL');
        const news = query.news.slice(0, 5).map(n => ({
            id: n.uuid,
            headline: n.title,
            url: n.link,
            source: n.publisher || 'Yahoo Finance',
            summary: n.title,
            datetime: Math.floor(new Date(n.providerPublishTime * 1000).getTime() / 1000)
        }));
        res.status(200).json(news);
    } catch {
        res.status(502).json({ error: "Failed to fetch news" });
    }
}

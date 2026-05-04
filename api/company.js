import YahooFinanceLib from 'yahoo-finance2';
const yahooFinance = new YahooFinanceLib();
yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

export default async function handler(req, res) {
  const { symbol } = req.query;
  try {
    const profile = await yahooFinance.quoteSummary(symbol, { modules: ['summaryProfile', 'price'] });
    const s = profile.summaryProfile;
    const p = profile.price;
    res.status(200).json({
        name: p?.shortName || symbol,
        ticker: symbol,
        exchange: p?.exchangeName || '',
        industry: s?.industry || 'Unknown',
        website: s?.website || '#',
        description: s?.longBusinessSummary || '',
        marketCap: p?.marketCap || 0
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch company profile" });
  }
}

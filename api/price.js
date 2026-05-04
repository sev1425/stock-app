import YahooFinanceLib from 'yahoo-finance2';
const yahooFinance = new YahooFinanceLib();
yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

export default async function handler(req, res) {
  const symbol = req.query.symbol;
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });
  try {
    const quote = await yahooFinance.quote(symbol);
    res.status(200).json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch price" });
  }
}

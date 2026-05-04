import YahooFinanceLib from 'yahoo-finance2';
const yahooFinance = new YahooFinanceLib();
yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

export default async function handler(req, res) {
  const benchmarks = [
    { symbol: '^GSPC', label: 'S&P 500' },
    { symbol: '^NDX', label: 'Nasdaq 100' },
    { symbol: '^DJI', label: 'Dow' }
  ];
  try {
    const results = await Promise.all(benchmarks.map(async b => {
      try {
        const quote = await yahooFinance.quote(b.symbol);
        return { symbol: b.label, price: quote.regularMarketPrice, change: quote.regularMarketChange, changePercent: quote.regularMarketChangePercent };
      } catch {
        return { symbol: b.label, price: null, change: null, changePercent: null };
      }
    }));
    res.status(200).json(results);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch market indices" });
  }
}

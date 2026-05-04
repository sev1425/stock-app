import YahooFinanceLib from 'yahoo-finance2';
const yahooFinance = new YahooFinanceLib();
yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

export default async function handler(req, res) {
  const { symbol, days = 14 } = req.query;
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - Number(days));
    
    // yahooFinance uses Date objects for period1 and period2
    const h = await yahooFinance.historical(symbol, {
      period1,
      period2: new Date(),
      interval: '1d'
    });

    if (!h || h.length === 0) {
      return res.status(200).json({ noData: true });
    }

    const labels = h.map(x => x.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    const prices = h.map(x => x.close);
    const times = h.map(x => Math.floor(x.date.getTime() / 1000));
    
    res.status(200).json({ labels, prices, times });
  } catch (err) {
    if (err.message && err.message.includes('No data')) {
        return res.status(200).json({ noData: true });
    }
    res.status(502).json({ error: "Failed to fetch historical data" });
  }
}

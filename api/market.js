export default async function handler(req, res) {
  const benchmarks = [
    { symbol: 'SPY', label: 'S&P 500' },
    { symbol: 'QQQ', label: 'Nasdaq 100' },
    { symbol: 'DIA', label: 'Dow' }
  ];
  try {
    const token = process.env.FINNHUB_API_KEY;
    if (!token) throw new Error("Missing FINNHUB_API_KEY");

    const results = await Promise.all(benchmarks.map(async b => {
      try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${b.symbol}&token=${token}`);
        const data = await response.json();
        if (data.c === 0 && data.d === null) throw new Error();
        return { symbol: b.label, price: data.c, change: data.d, changePercent: data.dp };
      } catch {
        return { symbol: b.label, price: null, change: null, changePercent: null };
      }
    }));
    res.status(200).json(results);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch market indices" });
  }
}

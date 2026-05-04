export default async function handler(req, res) {
  const { symbol, days = 14 } = req.query;
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  try {
    const token = process.env.FINNHUB_API_KEY;
    if (!token) throw new Error("Missing FINNHUB_API_KEY");

    const to = Math.floor(Date.now() / 1000);
    const from = to - (Number(days) * 24 * 60 * 60);

    const response = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol.toUpperCase()}&resolution=D&from=${from}&to=${to}&token=${token}`);
    const data = await response.json();

    if (data.s !== "ok" || !data.c || data.c.length === 0) {
      return res.status(200).json({ noData: true });
    }

    const labels = data.t.map(timestamp => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
    
    const prices = data.c;
    const times = data.t;
    
    res.status(200).json({ labels, prices, times });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch historical data" });
  }
}

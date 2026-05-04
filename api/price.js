export default async function handler(req, res) {
  const symbol = req.query.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });
  try {
    const token = process.env.FINNHUB_API_KEY;
    if (!token) throw new Error("Missing FINNHUB_API_KEY");

    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`);
    const data = await response.json();

    if (data.c === 0 && data.d === null) {
       return res.status(404).json({ error: "Symbol not found or no data" });
    }

    res.status(200).json({
      symbol: symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch price" });
  }
}

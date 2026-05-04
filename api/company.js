export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  try {
    const token = process.env.FINNHUB_API_KEY;
    if (!token) throw new Error("Missing FINNHUB_API_KEY");

    const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.toUpperCase()}&token=${token}`);
    const data = await response.json();

    if (!data || !data.ticker) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json({
        name: data.name || symbol,
        ticker: data.ticker,
        exchange: data.exchange || '',
        industry: data.finnhubIndustry || 'Unknown',
        website: data.weburl || '#',
        description: '', // Finnhub free tier doesn't provide a business summary
        marketCap: (data.marketCapitalization || 0) * 1000000
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch company profile" });
  }
}

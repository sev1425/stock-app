// Live stock price from Nasdaq's own API — no API key required
export default async function handler(req, res) {
  const symbol = req.query.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  try {
    const headers = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

    // Try stocks first, then ETF
    let data = null;
    for (const assetClass of ["stocks", "etf"]) {
      const url = `https://api.nasdaq.com/api/quote/${symbol}/info?assetClass=${assetClass}`;
      const response = await fetch(url, { headers });
      if (!response.ok) continue;
      const json = await response.json();
      if (json?.data?.primaryData?.lastSalePrice) {
        data = json.data;
        break;
      }
    }

    if (!data) {
      return res.status(404).json({ error: "Symbol not found or no data" });
    }

    const primary = data.primaryData;

    // Strip $ and commas
    const price = parseFloat(primary.lastSalePrice.replace(/[$,]/g, ""));
    const change = parseFloat(primary.netChange.replace(/[+,]/g, ""));
    const changePercent = parseFloat(
      primary.percentageChange.replace(/[+%,]/g, "")
    );

    res.status(200).json({ symbol, price, change, changePercent });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch price" });
  }
}

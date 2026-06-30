// Market indices via Nasdaq public API — no API key required
// SPY, QQQ, DIA are ETFs listed on Nasdaq
export default async function handler(req, res) {
  const benchmarks = [
    { symbol: "SPY", label: "S&P 500", assetClass: "etf" },
    { symbol: "QQQ", label: "Nasdaq 100", assetClass: "etf" },
    { symbol: "DIA", label: "Dow", assetClass: "etf" },
  ];

  const headers = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

  try {
    const results = await Promise.all(
      benchmarks.map(async (b) => {
        try {
          const url = `https://api.nasdaq.com/api/quote/${b.symbol}/info?assetClass=${b.assetClass}`;
          const response = await fetch(url, { headers });
          if (!response.ok) throw new Error("fetch failed");
          const json = await response.json();
          const primary = json?.data?.primaryData;
          if (!primary?.lastSalePrice) throw new Error("no data");

          const price = parseFloat(primary.lastSalePrice.replace(/[$,]/g, ""));
          const change = parseFloat(primary.netChange.replace(/[+,]/g, ""));
          const changePercent = parseFloat(
            primary.percentageChange.replace(/[+%,]/g, "")
          );

          return { symbol: b.label, price, change, changePercent };
        } catch {
          return { symbol: b.label, price: null, change: null, changePercent: null };
        }
      })
    );

    res.status(200).json(results);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch market indices" });
  }
}

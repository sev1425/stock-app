// Historical candle data from Nasdaq's public chart API — no API key required
export default async function handler(req, res) {
  const { symbol, days = 14 } = req.query;
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  try {
    const headers = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };
    const sym = symbol.toUpperCase();

    // Calculate date range
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - Number(days) - 5); // add buffer for weekends

    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    let chartData = null;
    for (const assetClass of ["stocks", "etf"]) {
      const url = `https://api.nasdaq.com/api/quote/${sym}/chart?assetClass=${assetClass}&fromDate=${fmt(fromDate)}&toDate=${fmt(toDate)}`;
      const response = await fetch(url, { headers });
      if (!response.ok) continue;
      const json = await response.json();
      if (json?.data?.chart?.length > 0) {
        chartData = json.data.chart;
        break;
      }
    }

    if (!chartData || chartData.length === 0) {
      return res.status(200).json({ noData: true });
    }

    const sliced = chartData.slice(-Number(days));
    const labels = [];
    const prices = [];
    const times = [];

    for (const point of sliced) {
      const close = parseFloat(point.y);
      const ts = point.x; // milliseconds
      if (isNaN(close)) continue;
      const dateObj = new Date(ts);
      labels.push(
        dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      );
      prices.push(close);
      times.push(Math.floor(ts / 1000));
    }

    if (prices.length === 0) return res.status(200).json({ noData: true });
    res.status(200).json({ labels, prices, times });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch historical data" });
  }
}

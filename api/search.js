// Symbol search via Nasdaq's autocomplete API — no API key required
export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(200).json([]);

  try {
    const headers = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };
    const url = `https://api.nasdaq.com/api/autocomplete/slookup/10?search=${encodeURIComponent(q)}`;
    const response = await fetch(url, { headers });

    if (!response.ok) return res.status(200).json([]);

    const json = await response.json();
    const items = json?.data;

    if (!Array.isArray(items)) return res.status(200).json([]);

    const results = items.slice(0, 6).map((item) => ({
      symbol: item.symbol,
      description: item.name || item.symbol,
      type: item.asset === "ETF" ? "ETF" : "Common Stock",
    }));

    res.status(200).json(results);
  } catch {
    res.status(502).json({ error: "Failed to search" });
  }
}

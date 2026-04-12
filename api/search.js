import { getFinnhubTokenOrError } from "../lib/finnhub.js";

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing search query" });
  }

  const TOKEN = getFinnhubTokenOrError(res);
  if (!TOKEN) return;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${TOKEN}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const data = await response.json();

    const mapped = (data.result || [])
      .filter((r) => !r.symbol.includes("."))
      .slice(0, 8)
      .map((result) => ({
        symbol: result.symbol,
        name: result.description,
      }));

    res.status(200).json(mapped);
  } catch {
    res.status(500).json({ error: "Failed to search stocks" });
  }
}

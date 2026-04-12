import { getFinnhubTokenOrError } from "../lib/finnhub.js";

export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Missing stock symbol" });
  }

  const TOKEN = getFinnhubTokenOrError(res);
  if (!TOKEN) return;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
        symbol.toUpperCase()
      )}&token=${TOKEN}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch company profile");
    }

    const data = await response.json();

    if (!data.name) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "Failed to load company profile" });
  }
}

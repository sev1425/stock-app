import { getFinnhubTokenOrError } from "../lib/finnhub.js";

export default async function handler(req, res) {
  const { symbol } = req.query;
  const days = Math.min(Math.max(Number(req.query.days) || 14, 5), 365);

  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol" });
  }

  const TOKEN = getFinnhubTokenOrError(res);
  if (!TOKEN) return;

  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 86400;

  try {
    const url = new URL("https://finnhub.io/api/v1/stock/candle");
    url.searchParams.set("symbol", symbol.toUpperCase());
    url.searchParams.set("resolution", "D");
    url.searchParams.set("from", String(from));
    url.searchParams.set("to", String(to));
    url.searchParams.set("token", TOKEN);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Candle request failed");
    }

    const data = await response.json();

    if (data.s === "no_data" || !data.c?.length) {
      return res.status(200).json({ noData: true });
    }

    const labels = data.t.map((t) =>
      new Date(t * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    );

    res.status(200).json({
      labels,
      prices: data.c,
      times: data.t,
    });
  } catch {
    res.status(502).json({ error: "Failed to load chart data" });
  }
}

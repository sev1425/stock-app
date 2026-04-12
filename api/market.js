import { getFinnhubTokenOrError } from "../lib/finnhub.js";

const BENCHMARKS = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "Nasdaq 100" },
  { symbol: "DIA", label: "Dow" },
  { symbol: "IWM", label: "Russell 2000" },
];

export default async function handler(req, res) {
  const TOKEN = getFinnhubTokenOrError(res);
  if (!TOKEN) return;

  try {
    const results = await Promise.all(
      BENCHMARKS.map(async ({ symbol, label }) => {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${TOKEN}`
        );
        if (!r.ok) {
          return { symbol, label, price: null, change: null };
        }
        const d = await r.json();
        return {
          symbol,
          label,
          price: d.c ?? null,
          change: d.dp ?? null,
        };
      })
    );

    res.status(200).json(results);
  } catch {
    res.status(502).json({ error: "Failed to load market snapshot" });
  }
}

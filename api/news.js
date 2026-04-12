import { getFinnhubTokenOrError } from "../lib/finnhub.js";

export default async function handler(req, res) {
  const TOKEN = getFinnhubTokenOrError(res);
  if (!TOKEN) return;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();

    const topNews = data.slice(0, 10).map((article) => ({
      id: article.id,
      headline: article.headline,
      source: article.source,
      url: article.url,
      summary: article.summary,
      datetime: article.datetime,
    }));

    res.status(200).json(topNews);
  } catch {
    res.status(500).json({ error: "Failed to fetch market news" });
  }
}

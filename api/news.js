// Financial news via Google News RSS — no API key required
export default async function handler(req, res) {
  try {
    const rssUrl =
      "https://news.google.com/rss/search?q=stock+market+finance&hl=en-US&gl=US&ceid=US:en";

    const response = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) throw new Error("RSS fetch failed");

    const text = await response.text();

    // Parse RSS XML manually (no external parser needed)
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6);

    const news = items.map((match, idx) => {
      const item = match[1];
      const headline = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
        item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || "No title";
      const url =
        item.match(/<link>(.*?)<\/link>/)?.[1]?.trim() ||
        item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1]?.trim() ||
        "#";
      const source =
        item.match(/<source[^>]*>(.*?)<\/source>/)?.[1]?.trim() ||
        "Google News";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim();
      const datetime = pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Date.now() / 1000;

      return {
        id: idx + 1,
        headline,
        url,
        source,
        summary: "",
        datetime,
      };
    });

    res.status(200).json(news);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch news" });
  }
}

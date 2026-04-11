export default async function handler(req, res) {
  try {
    const TOKEN = "d7d6pspr01qggoen710gd7d6pspr01qggoen7110"; 
    
    // Fetch live market news
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Finnhub returns a massive array, let's just send back the top 10 articles
    const topNews = data.slice(0, 10).map(article => ({
        id: article.id,
        headline: article.headline,
        source: article.source,
        url: article.url,
        summary: article.summary,
        // Convert UNIX timestamp to readable format locally later
        datetime: article.datetime 
    }));

    res.status(200).json(topNews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch market news" });
  }
}

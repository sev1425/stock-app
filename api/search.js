export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const TOKEN = "d7d6pspr01qggoen710gd7d6pspr01qggoen7110"; 
    
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${TOKEN}`
    );
    
    if (!response.ok) {
        throw new Error(`Failed to fetch search results`);
    }

    const data = await response.json();
    
    // Filter to just show exactly matching equities to avoid random noise
    const mapped = (data.result || [])
        .filter(r => !r.symbol.includes('.')) // filtering out international exchanges for simplicity
        .slice(0, 8) 
        .map(result => ({
            symbol: result.symbol,
            name: result.description
        }));

    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed to search stocks" });
  }
}

export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Missing symbol" });
  }

  try {
    // Hidden API key on backend!
    const TOKEN = "d7d6pspr01qggoen710gd7d6pspr01qggoen7110"; 
    
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();

    res.status(200).json({
      price: data.c || 100,
      change: data.dp || 0,
      symbol: symbol.toUpperCase()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock data", price: 100, change: 0 });
  }
}

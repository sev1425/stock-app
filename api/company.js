// Company profile from Nasdaq's public API — no API key required
export default async function handler(req, res) {
  const symbol = req.query.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  try {
    const headers = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

    let data = null;
    let assetClassFound = "stocks";
    for (const assetClass of ["stocks", "etf"]) {
      const url = `https://api.nasdaq.com/api/quote/${symbol}/info?assetClass=${assetClass}`;
      const response = await fetch(url, { headers });
      if (!response.ok) continue;
      const json = await response.json();
      if (json?.data?.primaryData?.lastSalePrice) {
        data = json.data;
        assetClassFound = assetClass;
        break;
      }
    }

    if (!data) {
      return res.status(404).json({ error: "Company not found" });
    }

    const primary = data.primaryData;
    const price = parseFloat(primary.lastSalePrice.replace(/[$,]/g, ""));
    const volumeStr = primary.volume?.replace(/,/g, "") || "0";
    const volume = parseFloat(volumeStr);

    // Attempt to get additional summary info
    let industry = assetClassFound === "etf" ? "ETF" : "Unknown";
    let website = `https://www.nasdaq.com/market-activity/stocks/${symbol.toLowerCase()}`;

    try {
      const summaryUrl = `https://api.nasdaq.com/api/company/${symbol}/company-profile`;
      const summaryRes = await fetch(summaryUrl, { headers });
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        const profile = summaryJson?.data;
        if (profile?.Industry?.value) industry = profile.Industry.value;
        if (profile?.Website?.value) website = profile.Website.value;
      }
    } catch {
      // Profile is optional — continue with defaults
    }

    res.status(200).json({
      name: data.companyName || symbol,
      ticker: symbol,
      exchange: data.exchange || "NASDAQ",
      industry,
      website,
      description: "",
      marketCap: price * volume,
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch company profile" });
  }
}

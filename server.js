const express = require('express');
const cors = require('cors');
const path = require('path');

const NASDAQ_BASE = 'https://api.nasdaq.com/api';
const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' };

// ─── Nasdaq Helpers ─────────────────────────────────────────────────────────────

/**
 * Fetch a live quote from Nasdaq's public API.
 * Tries 'stocks' first, then 'etf'.
 */
async function fetchNasdaqQuote(symbol) {
  for (const assetClass of ['stocks', 'etf']) {
    const url = `${NASDAQ_BASE}/quote/${encodeURIComponent(symbol)}/info?assetClass=${assetClass}`;
    const response = await fetch(url, { headers: FETCH_HEADERS });
    if (!response.ok) continue;
    const json = await response.json();
    const primary = json?.data?.primaryData;
    if (primary?.lastSalePrice) {
      const price = parseFloat(primary.lastSalePrice.replace(/[$,]/g, ''));
      const change = parseFloat(primary.netChange.replace(/[+,]/g, ''));
      const changePercent = parseFloat(primary.percentageChange.replace(/[+%,]/g, ''));
      const volume = parseFloat((primary.volume || '0').replace(/,/g, ''));
      return { price, change, changePercent, volume, companyName: json.data.companyName, exchange: json.data.exchange };
    }
  }
  throw new Error('Symbol not found');
}

// ─── Express App ────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
const PORT = 3001;

// 1. Live Price
app.get('/api/price', async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
  try {
    const { price, change, changePercent } = await fetchNasdaqQuote(symbol);
    res.json({ symbol, price, change, changePercent });
  } catch {
    res.status(502).json({ error: 'Failed to fetch price' });
  }
});

// 2. Market Indices (SPY, QQQ, DIA — all ETFs on Nasdaq)
app.get('/api/market', async (req, res) => {
  const benchmarks = [
    { symbol: 'SPY', label: 'S&P 500' },
    { symbol: 'QQQ', label: 'Nasdaq 100' },
    { symbol: 'DIA', label: 'Dow' },
  ];
  try {
    const results = await Promise.all(
      benchmarks.map(async (b) => {
        try {
          const { price, change, changePercent } = await fetchNasdaqQuote(b.symbol);
          return { symbol: b.label, price, change, changePercent };
        } catch {
          return { symbol: b.label, price: null, change: null, changePercent: null };
        }
      })
    );
    res.json(results);
  } catch {
    res.status(502).json({ error: 'Failed to fetch market indices' });
  }
});

// 3. Historical Candles (Nasdaq chart API)
app.get('/api/candles', async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });

  try {
    const days = Number(req.query.days) || 14;
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days - 5); // buffer for weekends

    const fmt = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    let chartData = null;
    for (const assetClass of ['stocks', 'etf']) {
      const url = `${NASDAQ_BASE}/quote/${symbol}/chart?assetClass=${assetClass}&fromDate=${fmt(fromDate)}&toDate=${fmt(toDate)}`;
      const response = await fetch(url, { headers: FETCH_HEADERS });
      if (!response.ok) continue;
      const json = await response.json();
      if (json?.data?.chart?.length > 0) {
        chartData = json.data.chart;
        break;
      }
    }

    if (!chartData || chartData.length === 0) return res.json({ noData: true });

    const sliced = chartData.slice(-days);
    const labels = [], prices = [], times = [];

    for (const point of sliced) {
      const close = parseFloat(point.y);
      if (isNaN(close)) continue;
      const dateObj = new Date(point.x);
      labels.push(dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      prices.push(close);
      times.push(Math.floor(point.x / 1000));
    }

    if (prices.length === 0) return res.json({ noData: true });
    res.json({ labels, prices, times });
  } catch {
    res.status(502).json({ error: 'Failed to fetch historical data' });
  }
});

// 4. Company Profile
app.get('/api/company', async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
  try {
    const { price, volume, companyName, exchange } = await fetchNasdaqQuote(symbol);

    let industry = 'Unknown';
    let website = `https://www.nasdaq.com/market-activity/stocks/${symbol.toLowerCase()}`;

    try {
      const profileUrl = `${NASDAQ_BASE}/company/${symbol}/company-profile`;
      const profileRes = await fetch(profileUrl, { headers: FETCH_HEADERS });
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        const profile = profileJson?.data;
        if (profile?.Industry?.value) industry = profile.Industry.value;
        if (profile?.Website?.value) website = profile.Website.value;
      }
    } catch {
      // Optional — proceed with defaults
    }

    res.json({
      name: companyName || symbol,
      ticker: symbol,
      exchange: exchange || 'NASDAQ',
      industry,
      website,
      description: '',
      marketCap: price * volume,
    });
  } catch {
    res.status(502).json({ error: 'Failed to fetch company profile' });
  }
});

// 5. News — Google News RSS (no key needed)
app.get('/api/news', async (req, res) => {
  try {
    const rssUrl =
      'https://news.google.com/rss/search?q=stock+market+finance&hl=en-US&gl=US&ceid=US:en';
    const response = await fetch(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error('RSS fetch failed');
    const text = await response.text();
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6);
    const news = items.map((match, idx) => {
      const item = match[1];
      const headline =
        (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
          item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || 'No title';
      const url =
        item.match(/<link>(.*?)<\/link>/)?.[1]?.trim() ||
        item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1]?.trim() || '#';
      const source =
        item.match(/<source[^>]*>(.*?)<\/source>/)?.[1]?.trim() || 'Google News';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim();
      const datetime = pubDate
        ? Math.floor(new Date(pubDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000);
      return { id: idx + 1, headline, url, source, summary: '', datetime };
    });
    res.json(news);
  } catch {
    res.status(502).json({ error: 'Failed to fetch news' });
  }
});

// 6. Search — Nasdaq autocomplete (no key needed)
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const url = `${NASDAQ_BASE}/autocomplete/slookup/10?search=${encodeURIComponent(q)}`;
    const response = await fetch(url, { headers: FETCH_HEADERS });
    if (!response.ok) return res.json([]);
    const json = await response.json();
    const items = json?.data;
    if (!Array.isArray(items)) return res.json([]);
    const results = items.slice(0, 6).map((item) => ({
      symbol: item.symbol,
      description: item.name || item.symbol,
      type: item.asset === 'ETF' ? 'ETF' : 'Common Stock',
    }));
    res.json(results);
  } catch {
    res.status(502).json({ error: 'Failed to search' });
  }
});

// 7. Health
app.get('/api/health', (req, res) => {
  const host = req.get('host');
  res.json({
    status: 'ok',
    backend: 'express-nasdaq',
    dataSource: 'api.nasdaq.com (no API key required)',
    platform: 'local',
    publicUrl: host ? `http://${host}` : null,
  });
});

// Production: Serve React frontend
app.use(express.static(path.join(__dirname, 'build')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Backend API serving on http://localhost:${PORT}`);
  console.log(`   Data source: Nasdaq Public API (no API key required)`);
});

const express = require('express');
const cors = require('cors');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const app = express();
app.use(cors());

const PORT = 3001;

// 1. Live Price
app.get('/api/price', async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });
  try {
    const quote = await yahooFinance.quote(symbol);
    res.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch price" });
  }
});

// 2. Market Indices
app.get('/api/market', async (req, res) => {
  const benchmarks = [
    { symbol: '^GSPC', label: 'S&P 500' },
    { symbol: '^NDX', label: 'Nasdaq 100' },
    { symbol: '^DJI', label: 'Dow' }
  ];
  try {
    const results = await Promise.all(benchmarks.map(async b => {
      try {
        const quote = await yahooFinance.quote(b.symbol);
        return { symbol: b.label, price: quote.regularMarketPrice, change: quote.regularMarketChange, changePercent: quote.regularMarketChangePercent };
      } catch {
        return { symbol: b.label, price: null, change: null, changePercent: null };
      }
    }));
    res.json(results);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch market indices" });
  }
});

// 3. Candles (Historical data)
app.get('/api/candles', async (req, res) => {
  const { symbol, days = 14 } = req.query;
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - Number(days));
    
    // yahooFinance uses Date objects for period1 and period2
    const h = await yahooFinance.historical(symbol, {
      period1,
      period2: new Date(),
      interval: '1d'
    });

    if (!h || h.length === 0) {
      return res.json({ noData: true });
    }

    const labels = h.map(x => x.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    const prices = h.map(x => x.close);
    const times = h.map(x => Math.floor(x.date.getTime() / 1000));
    
    res.json({ labels, prices, times });
  } catch (err) {
    if (err.message && err.message.includes('No data')) {
        return res.json({ noData: true });
    }
    res.status(502).json({ error: "Failed to fetch historical data" });
  }
});

// 4. Company Profile
app.get('/api/company', async (req, res) => {
  const { symbol } = req.query;
  try {
    const profile = await yahooFinance.quoteSummary(symbol, { modules: ['summaryProfile', 'price'] });
    const s = profile.summaryProfile;
    const p = profile.price;
    res.json({
        name: p?.shortName || symbol,
        ticker: symbol,
        exchange: p?.exchangeName || '',
        industry: s?.industry || 'Unknown',
        website: s?.website || '#',
        description: s?.longBusinessSummary || '',
        marketCap: p?.marketCap || 0
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch company profile" });
  }
});

// 5. News
app.get('/api/news', async (req, res) => {
    try {
        const query = await yahooFinance.search('AAPL'); // Generic search returns news too
        const news = query.news.slice(0, 5).map(n => ({
            id: n.uuid,
            headline: n.title,
            url: n.link,
            source: n.publisher || 'Yahoo Finance',
            summary: n.title,
            datetime: Math.floor(new Date(n.providerPublishTime * 1000).getTime() / 1000)
        }));
        res.json(news);
    } catch {
        res.status(502).json({ error: "Failed to fetch news" });
    }
});

// 6. Search
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const query = await yahooFinance.search(q);
        const results = query.quotes.slice(0, 5).map(quote => ({
            symbol: quote.symbol,
            description: quote.shortname || quote.longname || quote.symbol,
            type: quote.quoteType
        }));
        res.json(results);
    } catch {
        res.status(502).json({ error: "Failed to search" });
    }
});

// 7. Health
app.get('/api/health', (req, res) => {
    res.json({ status: "ok", backend: "express-yahoo-finance" });
});

app.listen(PORT, () => {
  console.log(`Backend API serving on http://localhost:${PORT}`);
});

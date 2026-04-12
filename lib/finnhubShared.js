/**
 * Shared Finnhub calls for Vercel serverless routes and the local Express dev API.
 * Set FINNHUB_API_KEY in .env (see .env.example).
 */

function getToken() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key || !String(key).trim()) return null;
  return String(key).trim();
}

function missingKeyResponse() {
  return {
    status: 503,
    body: {
      error: "Market data is not configured. Add FINNHUB_API_KEY to your environment.",
      code: "FINNHUB_KEY_MISSING",
    },
  };
}

async function fetchQuote(symbol) {
  const TOKEN = getToken();
  if (!TOKEN) return missingKeyResponse();

  const sym = String(symbol || "").trim().toUpperCase();
  if (!sym) {
    return { status: 400, body: { error: "Missing symbol" } };
  }

  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${TOKEN}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub quote failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    status: 200,
    body: {
      price: data.c ?? 100,
      change: data.dp ?? 0,
      symbol: sym,
    },
  };
}

async function fetchNews() {
  const TOKEN = getToken();
  if (!TOKEN) return missingKeyResponse();

  const response = await fetch(
    `https://finnhub.io/api/v1/news?category=general&token=${TOKEN}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub news failed: ${response.statusText}`);
  }

  const data = await response.json();
  const topNews = (Array.isArray(data) ? data : []).slice(0, 10).map((article) => ({
    id: article.id,
    headline: article.headline,
    source: article.source,
    url: article.url,
    summary: article.summary,
    datetime: article.datetime,
  }));

  return { status: 200, body: topNews };
}

async function fetchSearch(q) {
  const TOKEN = getToken();
  if (!TOKEN) return missingKeyResponse();

  const query = String(q || "").trim();
  if (!query) {
    return { status: 400, body: { error: "Missing search query" } };
  }

  const response = await fetch(
    `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${TOKEN}`
  );

  if (!response.ok) {
    throw new Error("Finnhub search failed");
  }

  const data = await response.json();
  const mapped = (data.result || [])
    .filter((r) => !r.symbol.includes("."))
    .slice(0, 8)
    .map((result) => ({
      symbol: result.symbol,
      name: result.description,
    }));

  return { status: 200, body: mapped };
}

async function fetchCompanyProfile(symbol) {
  const TOKEN = getToken();
  if (!TOKEN) return missingKeyResponse();

  const sym = String(symbol || "").trim().toUpperCase();
  if (!sym) {
    return { status: 400, body: { error: "Missing stock symbol" } };
  }

  const response = await fetch(
    `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${TOKEN}`
  );

  if (!response.ok) {
    throw new Error("Finnhub profile failed");
  }

  const data = await response.json();

  if (!data.name) {
    return { status: 404, body: { error: "Company profile not found" } };
  }

  return { status: 200, body: data };
}

module.exports = {
  getToken,
  fetchQuote,
  fetchNews,
  fetchSearch,
  fetchCompanyProfile,
};

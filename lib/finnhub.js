/**
 * Shared Finnhub token resolution for serverless routes.
 * Token must be set as FINNHUB_API_KEY (Vercel env or .env for vercel dev).
 */
export function getFinnhubTokenOrError(res) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token || !String(token).trim()) {
    res.status(503).json({
      error:
        "Market data is not configured. Set FINNHUB_API_KEY in the server environment.",
    });
    return null;
  }
  return token.trim();
}

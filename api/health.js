export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    finnhubConfigured: Boolean(
      process.env.FINNHUB_API_KEY && String(process.env.FINNHUB_API_KEY).trim()
    ),
  });
}

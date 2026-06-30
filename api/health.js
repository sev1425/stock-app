function publicUrlFromRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers.host || "";
  if (!host) return null;
  return `${proto}://${host}`;
}

export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    backend: "vercel-nasdaq",
    dataSource: "api.nasdaq.com (no API key required)",
    platform: "vercel",
    publicUrl: publicUrlFromRequest(req),
  });
}

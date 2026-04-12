function apiBase() {
  return (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
}

/**
 * GET JSON from the app API (same origin on Vercel, or REACT_APP_API_BASE_URL, or proxied /api in dev).
 */
export async function apiGet(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${apiBase()}${p}`;
  const res = await fetch(url);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : res.statusText || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

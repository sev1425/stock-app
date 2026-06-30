import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet, getApiBaseDisplay } from "../services/api";

export default function Settings() {
  const { user, theme, toggleTheme, resetAccount } = useAuth();
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const runHealth = useCallback(async () => {
    setChecking(true);
    try {
      const h = await apiGet("/api/health");
      setHealth(h);
    } catch {
      setHealth({ status: "error" });
    } finally {
      setChecking(false);
    }
  }, []);

  const shareableUrl =
    (health && health.publicUrl) ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const copyPublicLink = useCallback(async () => {
    const url = shareableUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  }, [shareableUrl]);

  useEffect(() => {
    runHealth();
  }, [runHealth]);

  return (
    <div className="page-content fade-in settings-page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-grid">
        <section className="glass-panel settings-card">
          <h2 className="settings-card__title">Account</h2>
          <p className="settings-card__muted">
            Signed in as <strong>{user || "—"}</strong>
          </p>
        </section>

        <section className="glass-panel settings-card">
          <h2 className="settings-card__title">Appearance</h2>
          <p className="settings-card__muted">
            Current theme: <strong>{theme}</strong>
          </p>
          <button type="button" className="add-btn settings-action" onClick={toggleTheme}>
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </button>
        </section>

        <section className="glass-panel settings-card">
          <h2 className="settings-card__title">Market data &amp; API</h2>
          <p className="settings-card__muted">
            Quotes use the data source below. On{" "}
            <a href="https://vercel.com/docs" target="_blank" rel="noreferrer">
              Vercel
            </a>
            , <code className="settings-inline-code">/api/*</code> runs as serverless functions on the
            same public URL as the app (no separate API key for Nasdaq quotes).
          </p>
          <div className="settings-health">
            {health && (
              <ul className="settings-health__list">
                <li>
                  API status:{" "}
                  <span
                    className={health.status === "ok" ? "text-ok" : "text-bad"}
                    style={{
                      color: health.status === "ok" ? "#10b981" : "#ef4444",
                    }}
                  >
                    {health.status === "ok" ? "Reachable" : "Unreachable"}
                  </span>
                </li>
                <li>
                  Data source:{" "}
                  <span className="text-ok" style={{ color: "#10b981" }}>
                    {health.dataSource || "—"}
                  </span>
                </li>
                <li>
                  Backend: <span className="settings-card__muted">{health.backend || "—"}</span>
                </li>
                <li>
                  Host platform:{" "}
                  <span className="settings-card__muted">
                    {health.platform === "vercel"
                      ? "Vercel (public deployment)"
                      : health.platform === "local"
                        ? "Local Express"
                        : health.platform || "—"}
                  </span>
                </li>
                <li>
                  Browser API base:{" "}
                  <span className="settings-card__muted">{getApiBaseDisplay()}</span>
                </li>
                <li className="settings-health__link-row">
                  <span className="settings-health__label">Public link (share):</span>
                  <a
                    href={shareableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="settings-public-url"
                  >
                    {shareableUrl || "—"}
                  </a>
                  <button
                    type="button"
                    className="add-btn settings-action settings-action--ghost settings-action--compact"
                    onClick={copyPublicLink}
                    disabled={!shareableUrl}
                  >
                    {copyDone ? "Copied" : "Copy link"}
                  </button>
                </li>
              </ul>
            )}
            <button
              type="button"
              className="add-btn settings-action settings-action--ghost"
              onClick={runHealth}
              disabled={checking}
            >
              {checking ? "Checking…" : "Test connection"}
            </button>
          </div>
        </section>

        <section className="glass-panel settings-card settings-card--danger">
          <h2 className="settings-card__title">Danger zone</h2>
          <p className="settings-card__muted">
            Resets simulated cash, portfolio, watchlist, and activity. This cannot be undone.
          </p>
          <button
            type="button"
            className="logout-btn settings-action"
            onClick={resetAccount}
          >
            Reset demo account
          </button>
        </section>
      </div>

      <footer className="app-footer glass-panel">
        <p>
          StockPro is a paper-trading demo. Quotes and news are provided for
          educational purposes only and are not investment advice.
        </p>
      </footer>
    </div>
  );
}

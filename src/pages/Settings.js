import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../services/api";

export default function Settings() {
  const { user, theme, toggleTheme, resetAccount } = useAuth();
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const runHealth = useCallback(async () => {
    setChecking(true);
    try {
      const h = await apiGet("/api/health");
      setHealth(h);
    } catch {
      setHealth({ ok: false, finnhubConfigured: false });
    } finally {
      setChecking(false);
    }
  }, []);

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
          <h2 className="settings-card__title">Market data</h2>
          <p className="settings-card__muted">
            Backend health and Finnhub configuration (server-side only).
          </p>
          <div className="settings-health">
            {health && (
              <ul className="settings-health__list">
                <li>
                  API:{" "}
                  <span className={health.ok ? "text-ok" : "text-bad"}>
                    {health.ok ? "Reachable" : "Unreachable"}
                  </span>
                </li>
                <li>
                  Finnhub key:{" "}
                  <span
                    className={
                      health.finnhubConfigured ? "text-ok" : "text-warn"
                    }
                  >
                    {health.finnhubConfigured ? "Configured" : "Missing"}
                  </span>
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

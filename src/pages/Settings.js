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
            Backend connection health to Yahoo Finance proxy.
          </p>
          <div className="settings-health">
            {health && (
              <ul className="settings-health__list">
                <li>
                  Local API:{" "}
                  <span className={health.status === 'ok' ? "text-ok" : "text-bad"} style={{ color: health.status === 'ok' ? '#10b981' : '#ef4444' }}>
                    {health.status === 'ok' ? "Reachable" : "Unreachable"}
                  </span>
                </li>
                <li>
                  Data Source:{" "}
                  <span
                    className={
                      health.backend === 'express-yahoo-finance' ? "text-ok" : "text-warn"
                    }
                    style={{ color: health.backend === 'express-yahoo-finance' ? '#10b981' : '#ef4444' }}
                  >
                    {health.backend === 'express-yahoo-finance' ? "Yahoo Finance (Active)" : "Missing"}
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

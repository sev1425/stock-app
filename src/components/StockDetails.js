import { useState, useEffect } from "react";
import { apiGet } from "../services/api";

export default function StockDetails({ symbol }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setProfile(null);
    setError(null);
    (async () => {
      try {
        const data = await apiGet(
          `/api/company?symbol=${encodeURIComponent(symbol)}`
        );
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load profile");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (!symbol) return null;

  if (error) {
    return (
      <div className="glass-panel stock-detail-panel stock-detail-panel--error">
        <p className="stock-detail-panel__title">Company</p>
        <p className="stock-detail-panel__muted">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-panel stock-detail-panel stock-detail-panel--loading">
        <div className="stock-detail-skeleton" />
        <div className="stock-detail-skeleton stock-detail-skeleton--short" />
      </div>
    );
  }

  const cap = profile.marketCapitalization;
  let capLabel = null;
  if (cap != null && cap > 0) {
    capLabel =
      cap >= 1000
        ? `$${(cap / 1000).toFixed(2)}B`
        : `$${Number(cap).toFixed(0)}M`;
  }

  return (
    <div className="glass-panel stock-detail-panel fade-in">
      <div className="stock-detail-panel__head">
        <div>
          <h3 className="stock-detail-panel__name">{profile.name}</h3>
          <p className="stock-detail-panel__ticker">
            {profile.ticker || symbol} · {profile.exchange || "—"}
          </p>
        </div>
        {profile.logo && (
          <img
            src={profile.logo}
            alt=""
            className="stock-detail-panel__logo"
          />
        )}
      </div>
      <dl className="stock-detail-grid">
        <div>
          <dt>Sector</dt>
          <dd>{profile.finnhubIndustry || "—"}</dd>
        </div>
        <div>
          <dt>Country</dt>
          <dd>{profile.country || "—"}</dd>
        </div>
        {capLabel && (
          <div>
            <dt>Market cap</dt>
            <dd>{capLabel}</dd>
          </div>
        )}
        <div>
          <dt>Employees</dt>
          <dd>
            {profile.employeeTotal != null
              ? Number(profile.employeeTotal).toLocaleString()
              : "—"}
          </dd>
        </div>
      </dl>
      {profile.weburl && (
        <a
          className="stock-detail-panel__link"
          href={profile.weburl}
          target="_blank"
          rel="noreferrer"
        >
          Company website →
        </a>
      )}
    </div>
  );
}

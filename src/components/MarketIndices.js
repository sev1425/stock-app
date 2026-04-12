import { useState, useEffect } from "react";
import { apiGet } from "../services/api";

export default function MarketIndices() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet("/api/market");
        if (!cancelled && Array.isArray(data)) setItems(data);
      } catch {
        if (!cancelled) setError("Snapshot unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error && items.length === 0) {
    return (
      <div className="glass-panel market-indices market-indices--error fade-in">
        <span className="market-indices__hint">{error}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass-panel market-indices market-indices--loading fade-in">
        {["a", "b", "c", "d"].map((k) => (
          <div key={k} className="market-index-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel market-indices fade-in">
      {items.map((row) => {
        const ch = row.change;
        const pos = ch == null || ch >= 0;
        return (
          <div key={row.symbol} className="market-index-chip">
            <div className="market-index-chip__label">{row.label}</div>
            <div className="market-index-chip__symbol">{row.symbol}</div>
            <div className="market-index-chip__row">
              <span className="market-index-chip__price">
                {row.price != null
                  ? `$${Number(row.price).toFixed(2)}`
                  : "—"}
              </span>
              {ch != null && (
                <span
                  className={`market-index-chip__chg ${pos ? "positive" : "negative"}`}
                >
                  {pos ? "+" : ""}
                  {Number(ch).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

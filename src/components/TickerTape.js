import React, { useState, useEffect } from "react";
import { apiGet } from "../services/api";

export default function TickerTape() {
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    // We'll just fetch market indices and maybe some popular stocks to loop.
    async function loadTickers() {
      try {
        const data = await apiGet("/api/market"); 
        // fallback to some defaults if market returns empty
        const defaultTickers = [
            { symbol: "AAPL", price: 150, changePercent: 1.2 },
            { symbol: "TSLA", price: 200, changePercent: -0.5 },
            { symbol: "SPY", price: 500, changePercent: 0.1 },
            { symbol: "MSFT", price: 300, changePercent: 0.8 },
            { symbol: "NVDA", price: 450, changePercent: 2.1 }
        ];
        
        const sourceData = (Array.isArray(data) && data.length > 0) ? data : defaultTickers;
        // Duplicate so it scrolls infinitely without empty gaps
        setTickers([...sourceData, ...sourceData, ...sourceData]);
      } catch {
        // Ignored
      }
    }
    loadTickers();
  }, []);

  if (tickers.length === 0) return null;

  return (
    <div className="ticker-tape-container">
      <div className="ticker-tape-scroll">
        {tickers.map((t, idx) => {
           const cp = Number(t.changePercent || 0);
           const isPos = cp >= 0;
           return (
             <div key={idx} className="ticker-item">
               <span className="ticker-symbol">{t.symbol}</span>
               <span className="ticker-price">${Number(t.price).toFixed(2)}</span>
               <span className={`ticker-change ${isPos ? "positive" : "negative"}`}>
                  {isPos ? '▲' : '▼'} {Math.abs(cp).toFixed(2)}%
               </span>
             </div>
           );
        })}
      </div>
    </div>
  );
}

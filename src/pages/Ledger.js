import { useState, useEffect } from "react";

export default function Ledger() {
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ledger")) || [];
    setLedger(saved);
  }, []);

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <div>
          <h1>Activity</h1>
          <p className="page-subtitle">Paper-trade history</p>
        </div>
      </header>

      <div className="glass-panel ledger-panel">
        {ledger.length === 0 ? (
          <div className="empty-state">
            No transactions yet. Execute a trade from Discover to see it here.
          </div>
        ) : (
          <div className="ledger-table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Symbol</th>
                  <th>Shares</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((tx) => {
                  const dateObj = new Date(tx.date);
                  const isBuy = tx.type === "BUY";
                  return (
                    <tr key={tx.id} className="ledger-row">
                      <td>
                        {dateObj.toLocaleDateString()}{" "}
                        {dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <span
                          className={`ledger-type ${isBuy ? "buy" : "sell"}`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="ledger-symbol">{tx.symbol}</td>
                      <td>{tx.shares}</td>
                      <td>${tx.price?.toFixed(2)}</td>
                      <td>
                        $
                        {tx.total?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

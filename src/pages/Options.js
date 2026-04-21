import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../services/api";

export default function Options() {
  const { balance, updateBalance } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOptionsChain = async (e) => {
    e?.preventDefault();
    if (!symbol.trim()) return;
    setLoading(true);

    const s = symbol.toUpperCase().trim();
    // Simulate fetching live price first so strikes are centered
    let liveP = 150;
    try {
      const data = await apiGet(`/api/price?symbol=${s}`);
      if (data.price) liveP = Number(data.price);
    } catch {}

    // Generate mock options chain
    const strikes = [];
    const baseStrike = Math.round(liveP / 5) * 5;
    for (let i = -3; i <= 3; i++) {
        const strike = baseStrike + (i * 5);
        if (strike <= 0) continue;
        
        // Premium simple math
        const callDist = Math.max(strike - liveP, 0); // OTM call distance
        const callIntrinsic = Math.max(liveP - strike, 0);
        const callPrem = callIntrinsic + (Math.max(50 - callDist, 5) / 10) + Math.random();

        const putDist = Math.max(liveP - strike, 0);
        const putIntrinsic = Math.max(strike - liveP, 0);
        const putPrem = putIntrinsic + (Math.max(50 - putDist, 5) / 10) + Math.random();

        strikes.push({
            strike,
            call: callPrem.toFixed(2),
            put: putPrem.toFixed(2)
        });
    }

    setChain(strikes);
    setLoading(false);
  };

  const buyContract = (strike, type, premiumStr) => {
    const prem = Number(premiumStr);
    const cost = prem * 100; // 100 shares per contract
    if (balance < cost) {
        alert("Insufficient buying power for this contract!");
        return;
    }
    
    // Deduct
    updateBalance(balance - cost);

    // Save to portfolio
    const cur = JSON.parse(localStorage.getItem("portfolio")) || [];
    const tickerName = `${symbol.toUpperCase()} $${strike} ${type.toUpperCase()}`;
    
    const existing = cur.find((c) => c.symbol === tickerName);
    if (existing) {
        const newQty = existing.quantity + 1; // 1 contract
        const newAvg = ((existing.quantity * existing.avgPrice * 100) + cost) / (newQty * 100);
        existing.quantity = newQty;
        existing.avgPrice = newAvg;
    } else {
        cur.push({ symbol: tickerName, quantity: 1, avgPrice: prem, isOption: true });
    }
    localStorage.setItem("portfolio", JSON.stringify(cur));
    
    alert(`Successfully bought 1 ${tickerName} contract for $${cost.toFixed(2)}`);
  };

  return (
      <div className="page-content fade-in">
      <header className="page-header">
        <div>
          <h1>Options Trading</h1>
          <p className="page-subtitle">Simulated Call and Put contracts</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="page-subtitle" style={{marginBottom: "5px"}}>Options Buying Power</p>
          <h2 style={{color: "white"}}>${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
        </div>
      </header>
      
      <div className="glass-panel" style={{marginBottom: "20px"}}>
          <form className="controls-container" onSubmit={fetchOptionsChain}>
              <input
                  className="stock-input"
                  style={{flex: 1}}
                  placeholder="Enter symbol for Option Chain (e.g., TSLA)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
              />
              <button className="add-btn" type="submit" disabled={loading}>
                  {loading ? "Loading..." : "View Chain"}
              </button>
          </form>
      </div>

      {chain.length > 0 && (
          <div className="glass-panel" style={{overflowX: 'auto'}}>
              <h2 style={{marginBottom: '15px'}}>{symbol.toUpperCase()} - 1 Month Expiration</h2>
              <table className="ledger-table" style={{width: '100%', minWidth: '600px'}}>
                  <thead>
                      <tr>
                          <th style={{textAlign: "center", color: "#10b981", width: "30%"}}>CALLS (Ask)</th>
                          <th style={{textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)", width: "30%"}}>STRIKE</th>
                          <th style={{textAlign: "center", color: "#ef4444", width: "30%"}}>PUTS (Ask)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {chain.map((row) => (
                          <tr key={row.strike}>
                              <td style={{textAlign: "center"}}>
                                  <button className="buy-btn" onClick={() => buyContract(row.strike, 'Call', row.call)} style={{padding: '5px 15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
                                      ${row.call}
                                  </button>
                              </td>
                              <td style={{textAlign: "center", fontWeight: "bold", borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)"}}>
                                  ${row.strike}
                              </td>
                              <td style={{textAlign: "center"}}>
                                  <button className="buy-btn" onClick={() => buyContract(row.strike, 'Put', row.put)} style={{padding: '5px 15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>
                                      ${row.put}
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              <p className="chart-hint" style={{marginTop: "15px", textAlign: "center"}}>* Note: Buying 1 contract controls 100 shares. Total cost = Premium x 100.</p>
          </div>
      )}
      </div>
  );
}

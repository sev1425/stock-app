import { useState, useEffect } from "react";

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("portfolio")) || [
        { symbol: "AAPL", quantity: 15, avgPrice: 150 },
        { symbol: "TSLA", quantity: 5, avgPrice: 180 }
    ];
    setHoldings(saved);
  }, []);

  const totalValue = holdings.reduce((sum, item) => sum + (item.quantity * item.avgPrice), 0);

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <h1>My Portfolio</h1>
        <div className="portfolio-summary glass-panel">
            <h3>Total Value</h3>
            <h2 className="total-value">${totalValue.toLocaleString()}</h2>
        </div>
      </header>

      <div className="portfolio-grid grid-layout">
        {holdings.map((stock, i) => (
            <div key={i} className="glass-panel holding-card">
                <div className="holding-header">
                    <h2>{stock.symbol}</h2>
                    <span className="holding-qty">{stock.quantity} Shares</span>
                </div>
                <div className="holding-stats">
                    <p>Avg Buy: ${stock.avgPrice}</p>
                    <p>Total Equity: ${(stock.quantity * stock.avgPrice).toLocaleString()}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

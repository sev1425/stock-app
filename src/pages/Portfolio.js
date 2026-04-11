import { useState, useEffect } from "react";

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // These are static hold amounts, but the prices we will fetch live!
    const saved = JSON.parse(localStorage.getItem("portfolio")) || [
        { symbol: "AAPL", quantity: 15, avgPrice: 150 },
        { symbol: "TSLA", quantity: 5, avgPrice: 180 }
    ];
    
    // Fetch live prices for all holdings
    async function loadLivePrices() {
        const updatedHoldings = await Promise.all(saved.map(async (holding) => {
            try {
                const res = await fetch(`/api/price?symbol=${holding.symbol}`);
                const data = await res.json();
                return {
                    ...holding,
                    currentPrice: data.price
                };
            } catch {
                return { ...holding, currentPrice: holding.avgPrice }; // fallback
            }
        }));
        
        setHoldings(updatedHoldings);
        setLoading(false);
    }
    
    loadLivePrices();
  }, []);

  const totalEquity = holdings.reduce((sum, item) => sum + (item.quantity * (item.currentPrice || item.avgPrice)), 0);
  const totalCostBasis = holdings.reduce((sum, item) => sum + (item.quantity * item.avgPrice), 0);
  const totalProfit = totalEquity - totalCostBasis;
  const isProfitPositive = totalProfit >= 0;

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <h1>My Portfolio (Live)</h1>
        <div className="portfolio-summary glass-panel">
            <h3>Total Equity</h3>
            <h2 className="total-value">${totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            <p style={{ color: isProfitPositive ? '#10b981' : '#ef4444', margin: '5px 0 0 0', fontWeight: '500' }}>
                {isProfitPositive ? '+' : ''}${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} all time
            </p>
        </div>
      </header>

      {loading ? (
        <div className="empty-state">Fetching live market values...</div>
      ) : (
        <div className="portfolio-grid grid-layout">
          {holdings.map((stock, i) => {
              const stockEquity = stock.quantity * stock.currentPrice;
              const stockProfit = stockEquity - (stock.quantity * stock.avgPrice);
              const pPositive = stockProfit >= 0;

              return (
              <div key={i} className="glass-panel holding-card">
                  <div className="holding-header">
                      <h2>{stock.symbol}</h2>
                      <span className="holding-qty">{stock.quantity} Shares</span>
                  </div>
                  <div className="holding-stats">
                      <p>Current Price: <span style={{color: 'white'}}>${stock.currentPrice.toFixed(2)}</span></p>
                      <p>Avg Buy Price: ${stock.avgPrice.toFixed(2)}</p>
                      <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
                      <p>Total Equity: <span style={{color: 'white'}}>${stockEquity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
                      <p style={{ color: pPositive ? '#10b981' : '#ef4444' }}>
                         P/L: {pPositive ? '+' : ''}${stockProfit.toFixed(2)}
                      </p>
                  </div>
              </div>
              )
          })}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';

export default function Portfolio() {
  const { balance, updateBalance } = useAuth();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load ACTUAL bought stocks from localstorage
    const saved = JSON.parse(localStorage.getItem("portfolio")) || [];
    
    async function loadLivePrices() {
        if(saved.length === 0) {
            setHoldings([]);
            setLoading(false);
            return;
        }

        const updatedHoldings = await Promise.all(saved.map(async (holding) => {
            try {
                const res = await fetch(`/api/price?symbol=${holding.symbol}`);
                const data = await res.json();
                return {
                    ...holding,
                    currentPrice: data.price
                };
            } catch {
                return { ...holding, currentPrice: holding.avgPrice };
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

  const handleDeposit = () => {
      updateBalance(balance + 5000);
  };

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <h1>My Portfolio (Live)</h1>
        
        <div style={{display: 'flex', gap: '20px'}}>
            <div className="portfolio-summary glass-panel" style={{textAlign: 'center', flex:1}}>
                <h3>Buying Power</h3>
                <h2 className="total-value" style={{color: 'white'}}>${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                <button 
                  className="add-btn" 
                  style={{marginTop: '10px', fontSize: '0.85rem', padding: '8px 12px'}}
                  onClick={handleDeposit}
                >
                    + Add $5,000
                </button>
            </div>
            
            <div className="portfolio-summary glass-panel" style={{flex: 1}}>
                <h3>Total Invested Equity</h3>
                <h2 className="total-value">${totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                <p style={{ color: isProfitPositive ? '#10b981' : '#ef4444', margin: '5px 0 0 0', fontWeight: '500' }}>
                    {isProfitPositive ? '+' : ''}${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} all time
                </p>
            </div>
        </div>
      </header>

      {loading ? (
        <div className="empty-state">Fetching live market values...</div>
      ) : (
        <div className="portfolio-grid grid-layout">
          {holdings.length === 0 && (
              <div className="empty-state" style={{gridColumn: '1 / -1'}}>
                  You haven't bought any stocks yet! Head over to the Discover page to start trading.
              </div>
          )}
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

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TradeModal({ symbol, name, onClose }) {
  const { user, balance, updateBalance } = useAuth();
  const [shares, setShares] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function getPrice() {
      try {
        const res = await fetch(`/api/price?symbol=${symbol}`);
        const data = await res.json();
        setCurrentPrice(data.price);
      } catch (err) {
        setError('Failed to fetch live price');
      } finally {
        setLoading(false);
      }
    }
    getPrice();
  }, [symbol]);

  const totalCost = (shares * currentPrice) || 0;
  
  const executeTrade = () => {
      setError('');
      if (shares <= 0) {
          setError('Shares must be greater than 0');
          return;
      }
      if (totalCost > balance) {
          setError('Insufficient Buying Power!');
          return;
      }

      // Execute Paper Trade
      const newBalance = balance - totalCost;
      updateBalance(newBalance);

      // Save to Portfolio array
      let currentPortfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
      
      const existingPosIndex = currentPortfolio.findIndex(p => p.symbol === symbol);
      if (existingPosIndex >= 0) {
          const pos = currentPortfolio[existingPosIndex];
          // Recalculate average price safely
          const oldTotalValue = pos.quantity * pos.avgPrice;
          const newTotalValue = oldTotalValue + totalCost;
          const newQuantity = pos.quantity + Number(shares);
          
          currentPortfolio[existingPosIndex].quantity = newQuantity;
          currentPortfolio[existingPosIndex].avgPrice = newTotalValue / newQuantity;
      } else {
          currentPortfolio.push({
              symbol: symbol,
              name: name || symbol,
              quantity: Number(shares),
              avgPrice: currentPrice
          });
      }
      
      localStorage.setItem("portfolio", JSON.stringify(currentPortfolio));
      
      // Auto add to watchlist if not there
      let currentWatchlist = JSON.parse(localStorage.getItem("stocks")) || [];
      if(!currentWatchlist.includes(symbol)) {
          currentWatchlist.push(symbol);
          localStorage.setItem("stocks", JSON.stringify(currentWatchlist));
      }

      setSuccess(`Successfully bought ${shares} shares of ${symbol}!`);
      setTimeout(() => {
          onClose(); // close modal after success
      }, 1500);
  };

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div className="glass-panel modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
            <h2>Buy {symbol}</h2>
            <button className="delete-btn" onClick={onClose}>×</button>
        </div>
        
        {loading ? (
            <p>Fetching market liquidity...</p>
        ) : (
            <div className="modal-body">
                <p style={{color: 'var(--text-secondary)'}}>Current Market Price: <strong style={{color:'white'}}>${currentPrice.toFixed(2)}</strong></p>
                
                <div className="input-group" style={{marginTop: '20px'}}>
                    <label>Number of Shares</label>
                    <input 
                        type="number" 
                        min="1"
                        value={shares} 
                        onChange={(e) => setShares(e.target.value)} 
                    />
                </div>

                <div className="trade-preview glass-panel" style={{marginTop: '20px', padding: '15px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Total Cost:</span>
                        <span style={{color: 'var(--neon-red)'}}>-${totalCost.toFixed(2)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
                        <span>Buying Power:</span>
                        <span style={{color: totalCost > balance ? 'var(--neon-red)' : 'var(--neon-green)'}}>
                            ${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </span>
                    </div>
                </div>

                {error && <div className="error-message" style={{marginTop: '20px'}}>{error}</div>}
                {success && <div className="notification-toast" style={{marginTop: '20px', textAlign:'center'}}>{success}</div>}

                {!success && (
                    <button 
                        className="add-btn" 
                        style={{width: '100%', marginTop: '20px'}}
                        onClick={executeTrade}
                        disabled={totalCost > balance || shares <= 0}
                    >
                        Execute Trade
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

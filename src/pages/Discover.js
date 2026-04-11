import { useState, useEffect } from "react";

export default function Discover() {
  const [myStocks, setMyStocks] = useState([]);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("stocks")) || [];
    setMyStocks(saved);
  }, []);

  const addToWatchlist = (symbol) => {
    let currentStocks = JSON.parse(localStorage.getItem("stocks")) || [];
    if (!currentStocks.includes(symbol)) {
      currentStocks.push(symbol);
      localStorage.setItem("stocks", JSON.stringify(currentStocks));
      setMyStocks(currentStocks);
      
      // Temporary notification
      setNotification(`Added ${symbol} to Watchlist!`);
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const industries = [
    {
      name: "Big Tech Leaders",
      stocks: [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "MSFT", name: "Microsoft Corp." },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "AMZN", name: "Amazon.com Inc." },
        { symbol: "META", name: "Meta Platforms" }
      ]
    },
    {
      name: "Automotive & Energy",
      stocks: [
        { symbol: "TSLA", name: "Tesla Inc." },
        { symbol: "F", name: "Ford Motor Co." },
        { symbol: "GM", name: "General Motors" },
        { symbol: "XOM", name: "Exxon Mobil" }
      ]
    },
    {
      name: "Banking & Finance",
      stocks: [
        { symbol: "JPM", name: "JPMorgan Chase" },
        { symbol: "BAC", name: "Bank of America" },
        { symbol: "V", name: "Visa Inc." },
        { symbol: "MA", name: "Mastercard" }
      ]
    }
  ];

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <h1>Market Discover</h1>
        {notification && <div className="notification-toast">{notification}</div>}
      </header>

      <div className="discover-layout">
        {industries.map((industry) => (
          <div key={industry.name} className="glass-panel industry-section">
            <h2 className="industry-title">{industry.name}</h2>
            <div className="discover-grid">
              {industry.stocks.map(stock => {
                const isOwned = myStocks.includes(stock.symbol);
                return (
                  <div key={stock.symbol} className={`discover-card ${isOwned ? 'owned' : ''}`}>
                    <div className="discover-info">
                      <span className="discover-symbol">{stock.symbol}</span>
                      <span className="discover-name">{stock.name}</span>
                    </div>
                    <button 
                      className={`add-btn discover-btn ${isOwned ? 'disabled' : ''}`}
                      onClick={() => addToWatchlist(stock.symbol)}
                      disabled={isOwned}
                    >
                      {isOwned ? 'Added ✔' : 'Add +'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

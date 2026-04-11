import { useState, useEffect } from "react";
import TradeModal from "../components/TradeModal";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tradeTarget, setTradeTarget] = useState(null); // holds the symbol to open modal
  const [myStocks, setMyStocks] = useState([]);

  useEffect(() => {
    setMyStocks(JSON.parse(localStorage.getItem("stocks")) || []);
  }, []);

  // Update known stocks on modal close to catch if they bought something
  const handleModalClose = () => {
      setTradeTarget(null);
      setMyStocks(JSON.parse(localStorage.getItem("stocks")) || []);
  };

  const handleSearch = async (e) => {
      e.preventDefault();
      if(!searchQuery.trim()) return;
      
      setIsSearching(true);
      try {
          const res = await fetch(`/api/search?q=${searchQuery}`);
          const data = await res.json();
          setSearchResults(data);
      } catch (err) {
          console.error("Search failed", err);
      } finally {
          setIsSearching(false);
      }
  };

  const industries = [
    {
      name: "Big Tech Leaders",
      stocks: [{ symbol: "AAPL", name: "Apple Inc." }, { symbol: "MSFT", name: "Microsoft Corp." }, { symbol: "GOOGL", name: "Alphabet Inc." }]
    },
    {
      name: "Automotive & Energy",
      stocks: [{ symbol: "TSLA", name: "Tesla Inc." }, { symbol: "F", name: "Ford Motor Co." }, { symbol: "XOM", name: "Exxon Mobil" }]
    }
  ];

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <h1>Global Market Discovery</h1>
        
        <form onSubmit={handleSearch} className="controls-container" style={{width: '100%', maxWidth: '500px'}}>
            <input
                className="stock-input"
                style={{width: '100%'}}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any global company (e.g. Netflix, NFLX)..."
            />
            <button className="add-btn" type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
            </button>
        </form>
      </header>

      {/* Dynamic Search Results */}
      {searchResults.length > 0 && (
          <div className="glass-panel industry-section" style={{marginBottom: '40px', border: '1px solid var(--accent-blue)'}}>
              <h2 className="industry-title" style={{color:'white'}}>Search Results for "{searchQuery}"</h2>
              <div className="discover-grid">
              {searchResults.map(stock => {
                const isOwned = myStocks.includes(stock.symbol);
                return (
                  <div key={stock.symbol} className="discover-card" style={{background: 'rgba(59, 130, 246, 0.05)'}}>
                    <div className="discover-info">
                      <span className="discover-symbol">{stock.symbol}</span>
                      <span className="discover-name">{stock.name}</span>
                    </div>
                    <button 
                      className={`add-btn discover-btn`}
                      onClick={() => setTradeTarget({symbol: stock.symbol, name: stock.name})}
                    >
                      Trade
                    </button>
                  </div>
                )
              })}
              </div>
          </div>
      )}

      {/* Curated List */}
      <div className="discover-layout">
        {industries.map((industry) => (
          <div key={industry.name} className="glass-panel industry-section">
            <h2 className="industry-title">{industry.name}</h2>
            <div className="discover-grid">
              {industry.stocks.map(stock => {
                return (
                  <div key={stock.symbol} className="discover-card">
                    <div className="discover-info">
                      <span className="discover-symbol">{stock.symbol}</span>
                      <span className="discover-name">{stock.name}</span>
                    </div>
                    <button 
                      className="add-btn discover-btn"
                      onClick={() => setTradeTarget({symbol: stock.symbol, name: stock.name})}
                    >
                      Trade
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {tradeTarget && (
          <TradeModal 
            symbol={tradeTarget.symbol} 
            name={tradeTarget.name}
            onClose={handleModalClose} 
          />
      )}
    </div>
  );
}

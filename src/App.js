import { useState, useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";

// Premium dark mode configuration for Chart.js
Chart.defaults.color = "#94a3b8";
Chart.defaults.font.family = "'Outfit', sans-serif";
Chart.defaults.scale.grid.color = "rgba(255, 255, 255, 0.05)";

function App() {
  const [stocks, setStocks] = useState([]);
  const [input, setInput] = useState("");
  const [activeStock, setActiveStock] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("stocks")) || [];
    setStocks(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  // ✅ Fetching from our NEW Vercel Serverless Backend!
  const getStock = useCallback(async (symbol) => {
    try {
      const res = await fetch(`/api/price?symbol=${symbol}`);
      const data = await res.json();

      return {
        price: data.price || 100,
        change: data.change || 0,
      };
    } catch {
      return { price: 100, change: 0 };
    }
  }, []);

  function addStock(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const newSymbol = input.toUpperCase().trim();
    if (!stocks.includes(newSymbol)) {
      setStocks([...stocks, newSymbol]);
    }
    setInput("");
  }

  function removeStock(index, evt) {
    evt.stopPropagation();
    const removedSymbol = stocks[index];
    const newStocks = [...stocks];
    newStocks.splice(index, 1);
    setStocks(newStocks);
    
    if (activeStock === removedSymbol) {
      setActiveStock(null);
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    }
  }

  function drawChart(price, symbol, change) {
    setActiveStock(symbol);
    const ctx = chartRef.current;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    let prices = [];
    let labels = [];

    // Generate simulated historical text based on current price trend
    let trend = price;
    for (let i = 0; i < 7; i++) {
        // Just mock some historical data ending up at the true current price
        prices.unshift(trend);
        labels.unshift("Day " + (7 - i));
        trend = trend - (change > 0 ? Math.random() * 5 : -(Math.random() * 5));
    }

    const isPositive = change >= 0;
    const lineColor = isPositive ? "#10b981" : "#ef4444";
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, isPositive ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{ 
            label: symbol, 
            data: prices,
            borderColor: lineColor,
            backgroundColor: gradient,
            borderWidth: 3,
            tension: 0.4, // Smooth curved lines!
            fill: true,
            pointBackgroundColor: varColor => varColor.dataIndex === 6 ? lineColor : "transparent",
            pointBorderColor: "transparent",
            pointRadius: varColor => varColor.dataIndex === 6 ? 6 : 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(11, 15, 25, 0.9)",
                titleFont: { size: 14, family: "'Outfit'" },
                bodyFont: { size: 14, family: "'Outfit'" },
                padding: 12,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            y: { beginAtZero: false, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } }
        }
      }
    });
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Trading Dashboard</h1>
      </header>

      <form className="controls-container" onSubmit={addStock}>
        <input
          className="stock-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter stock symbol (e.g. AAPL)"
        />
        <button className="add-btn" type="submit">Add Stock</button>
      </form>

      <div className="dashboard">
        {/* Left Side: Watchlist */}
        <div className="glass-panel watchlist">
          {stocks.length === 0 ? (
            <div className="empty-state">No stocks added yet.</div>
          ) : (
            stocks.map((stock, index) => (
              <StockItem
                key={index}
                stock={stock}
                isActive={activeStock === stock}
                remove={(e) => removeStock(index, e)}
                showChart={drawChart}
                getStock={getStock}
              />
            ))
          )}
        </div>

        {/* Right Side: Graph Chart */}
        <div className="glass-panel chart-container">
            <div className="chart-header">
                <h2 className="chart-title">{activeStock ? `${activeStock} Performance` : 'Select a stock'}</h2>
                <div className="chart-status">
                    {activeStock ? 'Live View' : 'Click any stock on the left to view detailed charts.'}
                </div>
            </div>
            
            <div className="chart-wrapper">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
      </div>
    </div>
  );
}

function StockItem({ stock, isActive, remove, showChart, getStock }) {
  const [data, setData] = useState({ price: null, change: 0 });

  useEffect(() => {
    let basePrice = 100;

    async function init() {
      const d = await getStock(stock);
      basePrice = d.price;
      setData(d);
    }

    init();

    // ✅ Simulated live updates on top of the backend fetch
    const interval = setInterval(() => {
      basePrice = basePrice + (Math.random() * 2 - 1);
      setData(prev => ({
        price: basePrice.toFixed(2),
        change: prev.change // keeping original daily change static for visual consistency
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [stock, getStock]);

  const numChange = Number(data.change);
  const isPositive = numChange >= 0;
  
  return (
    <div 
        className={`stock-card ${isActive ? 'active' : ''}`} 
        onClick={() => showChart(Number(data.price), stock, numChange)}
    >
      <div className="stock-info">
        <span className="stock-symbol">{stock}</span>
        <span className="stock-price">${data.price || '---'}</span>
      </div>

      <div className="stock-stats">
        <span className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{data.change}%
        </span>
        <button className="delete-btn" onClick={remove}>×</button>
      </div>
    </div>
  );
}

export default App;
import { useState, useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";
import { apiGet } from "../services/api";
import MarketIndices from "../components/MarketIndices";
import StockDetails from "../components/StockDetails";

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [input, setInput] = useState("");
  const [activeStock, setActiveStock] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("stocks")) || ["AAPL", "TSLA"];
    setStocks(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  const getStock = useCallback(async (symbol) => {
    try {
      const data = await apiGet(
        `/api/price?symbol=${encodeURIComponent(symbol)}`
      );
      return {
        price: data.price != null ? Number(data.price) : null,
        change: data.change != null ? Number(data.change) : 0,
      };
    } catch {
      return { price: null, change: 0 };
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

  const showChart = useCallback(async (price, symbol, change) => {
    setActiveStock(symbol);
    const canvas = chartRef.current;
    if (!canvas) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    let labels = [];
    let prices = [];
    let usedLive = false;

    try {
      const candle = await apiGet(
        `/api/candles?symbol=${encodeURIComponent(symbol)}&days=14`
      );
      if (
        !candle.noData &&
        Array.isArray(candle.labels) &&
        Array.isArray(candle.prices) &&
        candle.prices.length > 1
      ) {
        labels = candle.labels;
        prices = candle.prices.map(Number);
        usedLive = true;
      }
    } catch {
      /* fallback chart */
    }

    if (!usedLive) {
      const base =
        price != null && !Number.isNaN(price) && price > 0 ? price : 150;
      const ch = typeof change === "number" ? change : 0;
      let trend = base;
      prices = [];
      labels = [];
      for (let i = 0; i < 7; i++) {
        prices.unshift(trend);
        labels.unshift(`Day ${7 - i}`);
        trend = trend - (ch > 0 ? Math.random() * 5 : -(Math.random() * 5));
      }
    }

    const last = prices[prices.length - 1];
    const first = prices[0];
    const isPositive = last >= first;
    const lineColor = isPositive ? "#10b981" : "#ef4444";
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(
      0,
      isPositive ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)"
    );
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    const lastIdx = prices.length - 1;

    chartInstance.current = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: symbol,
            data: prices,
            borderColor: lineColor,
            backgroundColor: gradient,
            borderWidth: 3,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: lineColor,
            pointBorderColor: "transparent",
            pointRadius: (c) => (c.dataIndex === lastIdx ? 6 : 0),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y;
                return v != null ? `$${Number(v).toFixed(2)}` : "";
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: false, border: { display: false } },
          x: { grid: { display: false }, border: { display: false } },
        },
      },
    });
  }, []);

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <div>
          <h1>Market Dashboard</h1>
          <p className="page-subtitle">
            Watchlist, live benchmarks, and price history
          </p>
        </div>
        <form className="controls-container" onSubmit={addStock}>
          <input
            className="stock-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add symbol (e.g. AAPL)"
          />
          <button className="add-btn" type="submit">
            Add
          </button>
        </form>
      </header>

      <MarketIndices />

      <div className="dashboard">
        <div className="glass-panel watchlist">
          {stocks.length === 0 ? (
            <div className="empty-state">No symbols in your watchlist yet.</div>
          ) : (
            stocks.map((stock, index) => (
              <StockItem
                key={stock}
                stock={stock}
                isActive={activeStock === stock}
                remove={(e) => removeStock(index, e)}
                showChart={showChart}
                getStock={getStock}
              />
            ))
          )}
        </div>

        <div className="dashboard-main">
          <div className="glass-panel chart-container">
            <div className="chart-header">
              <h2 className="chart-title">
                {activeStock ? `${activeStock} performance` : "Select a symbol"}
              </h2>
              {!activeStock && (
                <p className="chart-hint">
                  Click a row in your watchlist to load the chart and company
                  profile.
                </p>
              )}
            </div>
            <div className="chart-wrapper">
              <canvas ref={chartRef} />
            </div>
          </div>
          <StockDetails symbol={activeStock} />
        </div>
      </div>
    </div>
  );
}

function StockItem({ stock, isActive, remove, showChart, getStock }) {
  const [data, setData] = useState({ price: null, change: 0 });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const d = await getStock(stock);
      if (cancelled) return;
      setData(d);
    }
    init();

    const interval = setInterval(() => {
      setData((prev) => {
        if (prev.price == null) return prev;
        const n = Number(prev.price) + (Math.random() * 2 - 1);
        return { price: n, change: prev.change };
      });
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [stock, getStock]);

  const numChange = Number(data.change);
  const isPositive = numChange >= 0;
  const priceDisplay =
    data.price != null ? Number(data.price).toFixed(2) : "—";

  return (
    <div
      className={`stock-card ${isActive ? "active" : ""}`}
      onClick={() =>
        showChart(
          data.price != null ? Number(data.price) : null,
          stock,
          numChange
        )
      }
    >
      <div className="stock-info">
        <span className="stock-symbol">{stock}</span>
        <span className="stock-price">${priceDisplay}</span>
      </div>
      <div className="stock-stats">
        <span
          className={`change-badge ${isPositive ? "positive" : "negative"}`}
        >
          {isPositive ? "+" : ""}
          {numChange}%
        </span>
        <button className="delete-btn" type="button" onClick={remove}>
          ×
        </button>
      </div>
    </div>
  );
}

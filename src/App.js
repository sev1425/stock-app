import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function App() {
  const [stocks, setStocks] = useState([]);
  const [input, setInput] = useState("");
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("stocks")) || [];
    setStocks(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  // ✅ Fetch ONCE only
  async function getStock(symbol) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=d7d6pspr01qggoen710gd7d6pspr01qggoen7110`
      );
      const data = await res.json();

      return {
        price: data.c || 100,
        change: data.dp || 0,
      };
    } catch {
      return { price: 100, change: 0 };
    }
  }

  function addStock() {
    if (!input) return;
    setStocks([...stocks, input.toUpperCase()]);
    setInput("");
  }

  function removeStock(index) {
    const newStocks = [...stocks];
    newStocks.splice(index, 1);
    setStocks(newStocks);
  }

  function drawChart(price, symbol) {
    const ctx = chartRef.current;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    let prices = [];
    let labels = [];

    for (let i = 0; i < 7; i++) {
      prices.push(price + (Math.random() * 10 - 5));
      labels.push("Day " + (i + 1));
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{ label: symbol, data: prices }],
      },
    });
  }

  return (
    <div style={{ padding: 20, background: "#f5f6fa", minHeight: "100vh" }}>
      <h1>📈 Stock Watchlist (React)</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter stock"
      />
      <button onClick={addStock}>Add</button>

      <ul>
        {stocks.map((stock, index) => (
          <StockItem
            key={index}
            stock={stock}
            remove={() => removeStock(index)}
            showChart={drawChart}
            getStock={getStock}
          />
        ))}
      </ul>

      <canvas ref={chartRef} width="600" height="300"></canvas>
    </div>
  );
}

function StockItem({ stock, remove, showChart, getStock }) {
  const [data, setData] = useState({ price: 100, change: 0 });

  useEffect(() => {
    let basePrice = 100;

    async function init() {
      const d = await getStock(stock);
      basePrice = d.price;
      setData(d);
    }

    init();

    // ✅ Simulated live updates
    const interval = setInterval(() => {
      basePrice = basePrice + (Math.random() * 2 - 1);

      setData({
        price: basePrice.toFixed(2),
        change: (Math.random() * 2 - 1).toFixed(2),
      });
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock]);

  const color =
    data.change > 0 ? "green" : data.change < 0 ? "red" : "black";

  return (
    <li style={{ margin: 10 }}>
      <span onClick={() => showChart(Number(data.price), stock)}>
        <b>{stock}</b> - {data.price}
        <span style={{ color }}> ({data.change}%)</span>
      </span>

      <button onClick={remove}>❌</button>
    </li>
  );
}

export default App;
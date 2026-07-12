# 📈 StockTracker

A real-time stock and ETF tracking application built with React and Express. It leverages the Nasdaq public APIs to fetch live quotes, market indices, and historical chart data, presented in a clean and interactive user interface.

---

## ✨ Features

- **Real-Time Quotes:** Get live stock and ETF prices, volume, and percentage changes.
- **Market Indices:** Track major market ETFs like SPY, QQQ, and DIA.
- **Interactive Charts:** Visualize historical stock performance using Chart.js.
- **Fast & Reliable:** Backend built with Express to efficiently proxy requests to Nasdaq APIs, bypassing CORS issues.

---

## 🛠️ Tech Stack

**Frontend:**
- React 19
- React Router DOM
- Chart.js (Data visualization)

**Backend:**
- Node.js
- Express.js
- CORS

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.
- npm or yarn

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/sev1425/stock-app.git
cd stock-app
npm install
```

### 2. Running Locally

You can run both the frontend and backend concurrently using:
```bash
npm start
```
*(Note: If you have a combined start script, use it. Otherwise, start the server and react app separately).*

To start the backend server manually:
```bash
npm run start:server
```
The server will start on `http://localhost:3001`.

To start the frontend app:
```bash
npm start
```
The app will be available at `http://localhost:3000`.

---

## 📂 Project Structure

- `server.js` - Express backend fetching data from Nasdaq APIs.
- `src/` - React frontend application.
- `public/` - Static assets.
- `api/` - Serverless functions / backend logic (if applicable).

---

## 📝 License
This project is open-source and available under the MIT License.

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/news" element={<News />} />
            </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
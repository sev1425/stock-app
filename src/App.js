import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navigation />
          <main className="main-content">
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Secure Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/portfolio" element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                } />
                <Route path="/news" element={
                  <ProtectedRoute>
                    <News />
                  </ProtectedRoute>
                } />
              </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
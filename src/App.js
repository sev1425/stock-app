import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import Login from "./pages/Login";
import Discover from "./pages/Discover";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navigation />
          <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/discover" element={
                  <ProtectedRoute><Discover /></ProtectedRoute>
                } />
                <Route path="/portfolio" element={
                  <ProtectedRoute><Portfolio /></ProtectedRoute>
                } />
                <Route path="/news" element={
                  <ProtectedRoute><News /></ProtectedRoute>
                } />
              </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Don't show navigation on the login page
  if (location.pathname === '/login') return null;

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/discover", label: "Discover" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/news", label: "Market News" }
  ];

  return (
    <nav className="top-nav glass-panel">
      <div className="nav-brand">
        <h2>📈 StockPro</h2>
      </div>
      <div className="nav-links">
        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="nav-profile">
        <div className="avatar" title={user}>{user ? user.charAt(0).toUpperCase() : 'U'}</div>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}

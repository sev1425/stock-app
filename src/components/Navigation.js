import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Dashboard" },
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
        <div className="avatar">U</div>
      </div>
    </nav>
  );
}

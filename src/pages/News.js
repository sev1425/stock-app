import { useState, useEffect, useCallback } from "react";
import { apiGet } from "../services/api";

export default function News() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet("/api/news");
      setNewsItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Could not load news");
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <div>
          <h1>Market News</h1>
          <p className="page-subtitle">Headlines from global markets</p>
        </div>
        <button
          type="button"
          className="add-btn news-refresh"
          onClick={load}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && <div className="error-message banner-error">{error}</div>}

      {loading && newsItems.length === 0 ? (
        <div className="news-skeleton-grid grid-layout">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel news-card-skeleton" />
          ))}
        </div>
      ) : (
        <div className="news-feed grid-layout">
          {newsItems.length > 0 ? (
            newsItems.map((news, i) => {
              const dateObj = new Date(news.datetime * 1000);
              const timeString = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

              return (
                <article key={news.id ?? i} className="glass-panel news-card">
                  <h3 className="news-title">{news.headline}</h3>
                  <p className="news-excerpt">
                    {news.summary
                      ? `${news.summary.substring(0, 140)}${
                          news.summary.length > 140 ? "…" : ""
                        }`
                      : ""}
                  </p>
                  <div className="news-meta">
                    <span className="news-source">{news.source}</span>
                    <span className="news-time">{timeString}</span>
                  </div>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noreferrer"
                    className="read-more-btn"
                  >
                    Read article
                  </a>
                </article>
              );
            })
          ) : (
            <div className="empty-state">No headlines available right now.</div>
          )}
        </div>
      )}
    </div>
  );
}

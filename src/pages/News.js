import { useState, useEffect } from "react";

export default function News() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            if (Array.isArray(data)) {
                setNewsItems(data);
            }
        } catch (err) {
            console.error("Failed to fetch news", err);
        } finally {
            setLoading(false);
        }
    }
    fetchNews();
  }, []);

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <h1>Market News</h1>
      </header>
      
      {loading ? (
          <div className="empty-state">Fetching live market data...</div>
      ) : (
        <div className="news-feed grid-layout">
          {newsItems.length > 0 ? newsItems.map((news, i) => {
              // Convert UNIX timestamp cleanly
              const dateObj = new Date(news.datetime * 1000);
              const timeString = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

              return (
                <div key={i} className="glass-panel news-card">
                    <h3 className="news-title">{news.headline}</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                        {news.summary ? news.summary.substring(0, 100) + '...' : ''}
                    </p>
                    <div className="news-meta">
                        <span className="news-source">{news.source}</span>
                        <span className="news-time">{timeString}</span>
                    </div>
                    <a href={news.url} target="_blank" rel="noreferrer" className="read-more-btn" style={{textAlign: "center", textDecoration: "none"}}>
                        Read Article
                    </a>
                </div>
              )
          }) : (
              <div className="empty-state">No news available right now.</div>
          )}
        </div>
      )}
    </div>
  );
}

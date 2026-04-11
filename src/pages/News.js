export default function News() {
  const newsItems = [
    { title: "Tech Stocks Rally After Earnings Reports", time: "2 hours ago", source: "MarketWatch" },
    { title: "Federal Reserve Announces New Interest Rate Strategy", time: "4 hours ago", source: "Bloomberg" },
    { title: "Electric Vehicle Sector Sees Huge Investments in Q3", time: "6 hours ago", source: "Reuters" },
    { title: "Global Supply Chain Constraints Finally Easing", time: "1 day ago", source: "Wall Street Journal" }
  ];

  return (
    <div className="page-content fade-in">
      <header className="page-header">
        <h1>Market News</h1>
      </header>
      
      <div className="news-feed grid-layout">
        {newsItems.map((news, i) => (
            <div key={i} className="glass-panel news-card">
                <h3 className="news-title">{news.title}</h3>
                <div className="news-meta">
                    <span className="news-source">{news.source}</span>
                    <span className="news-time">{news.time}</span>
                </div>
                <button className="read-more-btn">Read Article</button>
            </div>
        ))}
      </div>
    </div>
  );
}

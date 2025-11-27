// pages/index.js
import { useEffect, useState } from "react";

export default function Home() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search(query) {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&per_page=20`);
      const json = await res.json();
      setResults(json.hits || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => { search(q); }, 180);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="page">
      <h1 className="logo">Public APIs — Search</h1>
      <div className="searchWrap">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          id="search-input"
          placeholder="Search APIs..."
          autoComplete="off"
          className="searchInput"
        />
        {loading && <div className="loading">Searching…</div>}
        <div id="autocomplete-results" className="results">
          {results.map(r => (
            <a key={r.id} className="result" href={r.url} target="_blank" rel="noreferrer">
              <div className="title">{r.api_name}</div>
              <div className="desc">{r.description}</div>
              <div className="meta">{r.category} • {r.auth || "No auth"} • {r.https ? "HTTPS" : "HTTP"}</div>
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .page { padding: 36px; font-family: Inter, Arial, sans-serif; }
        .logo { font-size: 28px; margin-bottom: 18px; }
        .searchWrap { position: relative; max-width: 820px; }
        .searchInput { width: 100%; padding: 14px 18px; border-radius: 28px; border: 1px solid #cfd8dc; font-size: 16px; }
        .results { margin-top: 10px; border-radius: 8px; overflow: hidden; }
        .result { display: block; padding: 12px 16px; border-bottom: 1px solid #eee; text-decoration: none; color: inherit; }
        .result:hover { background:#f6f9ff; }
        .title { font-weight: 600; }
        .desc { margin-top:6px; color:#555; font-size:14px; }
        .meta { margin-top:8px; font-size:12px; color:#777; }
        .loading { position:absolute; right:18px; top:14px; font-size:13px; color:#666; }
        @media (prefers-color-scheme: dark) {
          .logo { color: #e8eaed; }
          .page { background: #202124; color: #e8eaed; }
          .searchInput { background:#303134; border:1px solid #5f6368; color:#e8eaed; }
          .result { border-bottom:1px solid #343536; }
          .result:hover { background:#2b2d2f; }
          .desc { color:#c8c8c8; }
          .meta { color:#9aa0a6; }
        }
      `}</style>
    </div>
  );
}

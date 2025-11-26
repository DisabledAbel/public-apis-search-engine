// pages/index.jsx
import { useState, useEffect } from 'react';
import lunr from 'lunr';

export default function Home() {
  const [index, setIndex] = useState(null);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function loadIndex() {
      const [idxRes, dataRes] = await Promise.all([
        fetch('/index.json'),
        fetch('/data.json')
      ]);
      const idxJson = await idxRes.json();
      const docs = await dataRes.json();
      setIndex(lunr.Index.load(idxJson));
      setData(docs);
    }
    loadIndex();
  }, []);

  useEffect(() => {
    if (!index || !query) return setResults([]);
    const res = index.search(query).map(r => data.find(d => d.id === r.ref));
    setResults(res);
  }, [query, index, data]);

  return (
    <div className="container">
      <h1>Public APIs Search</h1>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search APIs..."
      />
      <ul>
        {results.map(r => (
          <li key={r.id}>
            <a href={r.url} target="_blank" rel="noreferrer">{r.api_name}</a> — {r.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

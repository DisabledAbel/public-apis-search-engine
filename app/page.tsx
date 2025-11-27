"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q) { setHits([]); return; }
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}&per_page=20`)
        .then(r => r.json())
        .then(j => setHits(j.hits || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold mb-4">Public APIs Search</h1>
      <div className="relative max-w-4xl">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search APIs..."
          className="w-full rounded-full px-6 py-3 border border-gray-300 dark:border-[#5f6368] bg-white dark:bg-[#303134] text-black dark:text-[#e8eaed]"
        />
        {loading && <div className="absolute right-4 top-3 text-sm text-gray-500 dark:text-gray-300">Searching…</div>}
        <div className="mt-3 rounded-md overflow-hidden">
          {hits.map(r => (
            <a key={r.id} href={r.url} target="_blank" rel="noreferrer"
               className="block p-4 border-b border-gray-100 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#2b2d2f]">
              <div className="font-semibold">{r.api_name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.description}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{r.category} • {r.auth || "No auth"} • {r.https ? "HTTPS" : "HTTP"}</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

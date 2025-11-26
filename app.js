// app.js
let idx, data;

async function loadIndex() {
  const [idxRes, dataRes] = await Promise.all([
    fetch('index.json'),
    fetch('data.json')
  ]);
  const idxJson = await idxRes.json();
  data = await dataRes.json();
  idx = lunr.Index.load(idxJson);
}

function renderResults(results) {
  const ul = document.getElementById('results');
  ul.innerHTML = '';
  results.forEach(r => {
    const doc = data.find(d => d.id === r.ref);
    const li = document.createElement('li');
    li.innerHTML = `<a href="${doc.url}" target="_blank">${doc.api_name}</a> — ${doc.description}`;
    ul.appendChild(li);
  });
}

document.getElementById('search').addEventListener('input', (e) => {
  if (!idx) return;
  const query = e.target.value;
  if (!query) return renderResults([]);
  const results = idx.search(query);
  renderResults(results);
});

loadIndex();

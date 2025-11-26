const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const https = require('https');

const apisFile = path.join(__dirname, '../apis.json'); // cached API data
const dataFile = path.join(__dirname, '../public/data.json');
const indexFile = path.join(__dirname, '../public/index.json');

// Helper to fetch JSON with retries
function fetchJSON(url, retries = 3, delay = 5000) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const options = { headers: { "User-Agent": "public-apis-search-bot", "Accept": "application/json" } };

      https.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            if (data.trim().startsWith('<')) throw new Error("Received HTML instead of JSON");
            resolve(JSON.parse(data));
          } catch (err) {
            if (n > 1) setTimeout(() => attempt(n - 1), delay);
            else reject(err);
          }
        });
      }).on('error', (err) => { if (n > 1) setTimeout(() => attempt(n - 1), delay); else reject(err); });
    };
    attempt(retries);
  });
}

// Load APIs with fallback and caching
async function loadAPIs() {
  let raw;
  try {
    console.log('Fetching latest APIs from upstream...');
    raw = await fetchJSON('https://api.publicapis.org/entries');
    fs.writeFileSync(apisFile, JSON.stringify(raw, null, 2));
    console.log('Updated cached apis.json');
  } catch (err) {
    console.warn('Fetch failed:', err.message);
    if (fs.existsSync(apisFile)) {
      try { raw = JSON.parse(fs.readFileSync(apisFile, 'utf8')); console.log('Loaded cached apis.json'); }
      catch { raw = { entries: [] }; console.warn('Cached apis.json invalid, using empty'); }
    } else { raw = { entries: [] }; console.warn('No cached apis.json, using empty'); }
  }

  if (!raw.entries || !Array.isArray(raw.entries)) raw.entries = [];
  return raw.entries;
}

// Build Lunr index
async function buildIndex() {
  const apis = await loadAPIs();

  const docs = apis.map((d, i) => ({
    id: i.toString(),
    api_name: d.API || d.name || '',
    description: d.Description || d.description || '',
    category: d.Category || d.category || '',
    auth: d.Auth || d.auth || 'none',
    https: !!(d.HTTPS === true || d.https === true),
    url: d.Link || d.link || d.Url || d.url || ''
  }));

  fs.writeFileSync(dataFile, JSON.stringify(docs, null, 2));

  const idx = lunr(function () {
    this.ref('id');
    this.field('api_name');
    this.field('description');
    this.field('category');
    docs.forEach(doc => this.add(doc));
  });

  fs.writeFileSync(indexFile, JSON.stringify(idx));
  console.log('Lunr index.json and data.json generated successfully!');
}

// Run build
buildIndex().catch(err => { console.error('Error building Lunr index:', err); process.exit(1); });

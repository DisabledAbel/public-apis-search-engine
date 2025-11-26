const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const https = require('https');

const apisFile = path.join(__dirname, '../apis.json');
const dataFile = path.join(__dirname, '../public/data.json');
const indexFile = path.join(__dirname, '../public/index.json');

// Helper to fetch JSON from a URL with proper headers
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "public-apis-search-bot",
        "Accept": "application/json"
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (data.trim().startsWith('<')) {
            return reject(new Error("Received HTML instead of JSON (rate-limit or invalid path)"));
          }
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse JSON from ${url}: ${err.message}\nRaw received:\n${data.substring(0, 200)}...`));
        }
      });
    }).on('error', reject);
  });
}

async function loadAPIs() {
  let raw;
  if (fs.existsSync(apisFile)) {
    try {
      raw = JSON.parse(fs.readFileSync(apisFile, 'utf8'));
      console.log('Loaded local apis.json');
    } catch (err) {
      console.warn('Local apis.json is invalid. Fetching from upstream API...');
      raw = await fetchJSON('https://api.publicapis.org/entries');
    }
  } else {
    console.log('apis.json not found. Fetching from upstream API...');
    raw = await fetchJSON('https://api.publicapis.org/entries');
  }

  // Validate that raw.entries exists and is an array
  if (!raw.entries || !Array.isArray(raw.entries)) {
    throw new Error('Upstream JSON is not in expected format (missing entries array)');
  }

  return raw.entries;
}

async function buildIndex() {
  const apis = await loadAPIs();

  // Transform data for Lunr
  const docs = apis.map((d, i) => ({
    id: i.toString(),
    api_name: d.API || d.name || '',
    description: d.Description || d.description || '',
    category: d.Category || d.category || '',
    auth: d.Auth || d.auth || 'none',
    https: !!(d.HTTPS === true || d.https === true),
    url: d.Link || d.link || d.Url || d.url || ''
  }));

  // Save data.json
  fs.writeFileSync(dataFile, JSON.stringify(docs, null, 2));

  // Build Lunr index
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

// Run the build
buildIndex().catch(err => {
  console.error('Error building Lunr index:', err);
  process.exit(1);
});

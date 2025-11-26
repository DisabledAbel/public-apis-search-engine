const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const https = require('https');

const apisFile = path.join(__dirname, '../apis.json');
const dataFile = path.join(__dirname, '../public/data.json');
const indexFile = path.join(__dirname, '../public/index.json');

// Helper to fetch JSON from URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
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
      console.warn('Local apis.json is invalid. Fetching from upstream...');
      raw = await fetchJSON('https://raw.githubusercontent.com/public-apis/public-apis/master/entries.json');
    }
  } else {
    console.log('apis.json not found. Fetching from upstream...');
    raw = await fetchJSON('https://raw.githubusercontent.com/public-apis/public-apis/master/entries.json');
  }
  return raw.entries || raw; // support both local and upstream formats
}

async function buildIndex() {
  const raw = await loadAPIs();

  const docs = raw.map((d, i) => ({
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

buildIndex().catch(err => {
  console.error('Error building Lunr index:', err);
  process.exit(1);
});

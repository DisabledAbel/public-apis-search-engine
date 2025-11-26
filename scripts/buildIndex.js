// scripts/buildIndex.js
const fs = require('fs');
const path = require('path');
const lunr = require('lunr');

const apisFile = path.join(__dirname, '../apis.json');
const dataFile = path.join(__dirname, '../public/data.json');
const indexFile = path.join(__dirname, '../public/index.json');

if (!fs.existsSync(apisFile)) {
  console.error('apis.json not found!');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(apisFile, 'utf8'));

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

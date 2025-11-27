const fs = require("fs");
const path = require("path");
const lunr = require("lunr");
const https = require("https");

const apisFile = path.join(__dirname, "../apis.json");
const dataFile = path.join(__dirname, "../public/data.json");
const indexFile = path.join(__dirname, "../public/index.json");

function fetchJSON(url, retries = 3, delay = 5000) {
  return new Promise((resolve) => {
    const attempt = (n) => {
      https.get(url, { headers: { "User-Agent": "github-actions", Accept: "application/json" } }, res => {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", () => {
          try { resolve(JSON.parse(data).entries || []); }
          catch { if (n > 1) setTimeout(() => attempt(n - 1), delay); else resolve([]); }
        });
      }).on("error", () => { if (n > 1) setTimeout(() => attempt(n - 1), delay); else resolve([]); });
    };
    attempt(retries);
  });
}

async function loadAPIs() {
  let entries = [];
  try {
    entries = await fetchJSON("https://api.publicapis.org/entries");
    fs.writeFileSync(apisFile, JSON.stringify({ entries }, null, 2));
  } catch {}
  if (entries.length === 0 && fs.existsSync(apisFile)) {
    try { entries = JSON.parse(fs.readFileSync(apisFile, "utf8")).entries || []; } catch {}
  }
  return entries;
}

async function buildIndex() {
  const entries = await loadAPIs();
  fs.writeFileSync(dataFile, JSON.stringify(entries, null, 2));

  const idx = lunr(function () {
    this.ref("id");
    this.field("api_name");
    this.field("description");
    entries.forEach((d, i) => {
      d.id = i.toString();
      this.add(d);
    });
  });
  fs.writeFileSync(indexFile, JSON.stringify(idx));
}

buildIndex().catch(console.error);

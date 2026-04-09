const express = require(‘express’);
const fetch = (…args) => import(‘node-fetch’).then(({default: f}) => f(…args));

const app = express();
const PORT = process.env.PORT || 3000;
const METAFIDE_BASE = ‘https://api.metafide.io’;

// ── CORS headers on every response ──────────────────────
app.use((req, res, next) => {
res.header(‘Access-Control-Allow-Origin’, ‘*’);
res.header(‘Access-Control-Allow-Methods’, ‘GET, POST, OPTIONS’);
res.header(‘Access-Control-Allow-Headers’, ‘Content-Type, x-api-key, Authorization, Accept’);
if (req.method === ‘OPTIONS’) return res.sendStatus(204);
next();
});

app.use(express.json());

// ── Proxy all /v1/ requests to Metafide ─────────────────
app.all(’/v1/*’, async (req, res) => {
try {
const targetURL = METAFIDE_BASE + req.url;
const headers = {};
if (req.headers[‘x-api-key’])     headers[‘x-api-key’] = req.headers[‘x-api-key’];
if (req.headers[‘content-type’])  headers[‘Content-Type’] = req.headers[‘content-type’];

```
const options = {
  method: req.method,
  headers,
  ...(req.method !== 'GET' && { body: JSON.stringify(req.body) })
};

const mfRes = await fetch(targetURL, options);
const data  = await mfRes.json().catch(() => ({}));
res.status(mfRes.status).json(data);
```

} catch (err) {
res.status(502).json({ error: err.message });
}
});

app.get(’/’, (req, res) => res.json({ status: ‘BlockChainBaneBot CORS Proxy running’ }));

app.listen(PORT, () => console.log(`Proxy live on port ${PORT}`));

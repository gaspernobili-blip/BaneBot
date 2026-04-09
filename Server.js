const https = require('https');
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return;
  }

  const target = 'https://api.metafide.io' + req.url;
  const parsed = url.parse(target);
  const options = {
    hostname: parsed.hostname,
    path: parsed.path,
    method: req.method,
    headers: { 'x-api-key': req.headers['x-api-key'] || '', 'Content-Type': 'application/json' }
  };

  const proxy = https.request(options, (mfRes) => {
    res.writeHead(mfRes.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    mfRes.pipe(res);
  });

  proxy.on('error', (e) => { res.writeHead(502); res.end(JSON.stringify({ error: e.message })); });
  req.pipe(proxy);

}).listen(PORT, () => console.log('Proxy running on port ' + PORT));

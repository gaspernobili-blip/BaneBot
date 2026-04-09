const https = require('https');
const http = require('http');

http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  var path = req.url;
  var body = '';
  req.on('data', function(chunk) { body += chunk; });
  req.on('end', function() {
    var options = {
      hostname: 'api.metafide.io',
      port: 443,
      path: path,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': req.headers['x-api-key'] || ''
      }
    };

    var proxy = https.request(options, function(mfRes) {
      res.writeHead(mfRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      mfRes.pipe(res);
    });

    proxy.on('error', function(e) {
      res.writeHead(502);
      res.end(JSON.stringify({ error: e.message }));
    });

    if (body) proxy.write(body);
    proxy.end();
  });

}).listen(process.env.PORT || 3000, function() {
  console.log('Proxy running');
});

p

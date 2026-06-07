// deploy force v2
const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version, anthropic-beta, anthropic-dangerous-direct-browser-access');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

function proxy(targetUrl, req, res) {
  const parsed = new URL(targetUrl);
  const lib = parsed.protocol === 'https:' ? https : http;
  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, */*',
      'Origin': 'https://polymarket.com',
      'Referer': 'https://polymarket.com/',
    }
  };
  if (req.headers['x-api-key']) options.headers['x-api-key'] = req.headers['x-api-key'];
  if (req.headers['anthropic-version']) options.headers['anthropic-version'] = req.headers['anthropic-version'];
  if (req.headers['anthropic-beta']) options.headers['anthropic-beta'] = req.headers['anthropic-beta'];

  const preq = lib.request(options, pres => {
    res.status(pres.statusCode);
    if (pres.headers['content-type']) res.setHeader('Content-Type', pres.headers['content-type']);
    pres.pipe(res);
  });
  preq.on('error', err => res.status(502).json({ error: err.message }));
  if (req.body && Object.keys(req.body).length) preq.write(JSON.stringify(req.body));
  preq.end();
}

app.all('/api/poly/*', (req, res) => {
  const suffix = req.params[0];
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  proxy(`https://polymarket-proxy.flrcarvalho.workers.dev/${suffix}${qs}`, req, res);
});

app.all('/api/bcb/*', (req, res) => {
  const suffix = req.params[0];
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  proxy(`https://olinda.bcb.gov.br/${suffix}${qs}`, req, res);
});

app.all('/api/anthropic/*', (req, res) => {
  const suffix = req.params[0];
  proxy(`https://api.anthropic.com/${suffix}`, req, res);
});

const RPCS = [
  'https://polygon-bor-rpc.publicnode.com',
  'https://polygon.llamarpc.com',
  'https://rpc.ankr.com/polygon',
];

app.post('/api/polygon', async (req, res) => {
  for (const rpc of RPCS) {
    try {
      await new Promise((resolve, reject) => {
        const parsed = new URL(rpc);
        const body = JSON.stringify(req.body);
        const opts = {
          hostname: parsed.hostname,
          path: parsed.pathname || '/',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };
        const preq = https.request(opts, pres => {
          let data = '';
          pres.on('data', d => data += d);
          pres.on('end', () => { try { res.json(JSON.parse(data)); resolve(); } catch(e) { reject(e); } });
        });
        preq.on('error', reject);
        preq.write(body);
        preq.end();
      });
      return;
    } catch(e) {}
  }
  res.status(502).json({ error: 'All RPCs failed' });
});

app.get('/health', (_, res) => res.json({ ok: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));

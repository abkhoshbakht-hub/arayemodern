const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || process.argv[2] || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') {
    res.writeHead(302, { Location: '/previews/arayemodern/en.html' });
    res.end();
    return;
  }

  urlPath = urlPath.replace(/^\/previews\/arayemodern/, '');
  if (urlPath === '' || urlPath === '/') urlPath = '/fa.html';

  let filePath = path.join(ROOT, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (urlPath === '/fa' || urlPath === '/en' || urlPath === '/ar') {
      filePath = path.join(ROOT, `${urlPath.slice(1)}.html`);
    }
  }

  const noCache = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
  };

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, ...noCache });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const fallback = path.join(ROOT, 'fa.html');
    if (fs.existsSync(fallback)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...noCache });
      fs.createReadStream(fallback).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Araye Modern is running on http://localhost:${PORT}`);
});

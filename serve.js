const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || process.argv[2] || 3000);
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

// Mimics the Apache .htaccess rules so local preview matches production:
//   /fa            -> /fa.html
//   /fa/services   -> /fa/services.html
//   /fa/services.html -> 301 -> /fa/services
function resolve(urlPath) {
  // real file (assets, /_next/, /img/, /js/, /fonts/)
  const direct = path.join(ROOT, urlPath);
  if (urlPath !== '/' && fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;

  // directory -> index.html
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) {
    const idx = path.join(direct, 'index.html');
    if (fs.existsSync(idx)) return idx;
  }

  // extensionless -> .html
  const asHtml = direct + '.html';
  if (fs.existsSync(asHtml)) return asHtml;

  // root language pages: /fa -> /fa.html
  const rootHtml = path.join(ROOT, `${urlPath.slice(1)}.html`);
  if (/^\/(fa|en|ar)$/.test(urlPath) && fs.existsSync(rootHtml)) return rootHtml;

  return null;
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  const noCache = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
  };

  if (urlPath === '/' || urlPath === '') {
    const idx = path.join(ROOT, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME['.html'], ...noCache });
    fs.createReadStream(idx).pipe(res);
    return;
  }

  // 301 for the old .html form, same as the .htaccess rule
  if (urlPath.endsWith('.html')) {
    const clean = urlPath.replace(/\.html$/, '');
    const target = resolve(clean) ? clean : urlPath;
    if (resolve(target)) {
      res.writeHead(301, { Location: target, ...noCache });
      res.end();
      return;
    }
  }

  const filePath = resolve(urlPath);

  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', ...noCache });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...noCache });
    res.end('404 Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Araye Modern is running on http://localhost:${PORT}`);
});

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvePublicPath } from './public-path.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const requestedPort = Number(process.argv[process.argv.indexOf('--port') + 1]) || 4178;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filename = resolvePublicPath(root, pathname);
    if (!filename) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    const info = await stat(filename);
    if (!info.isFile()) { response.writeHead(404); response.end('Not found'); return; }
    const body = await readFile(filename);
    response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
server.listen(requestedPort, '127.0.0.1', () => process.stdout.write(`Window Seat is ready: http://127.0.0.1:${requestedPort}\n`));
server.on('error', error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

// a CommonJS require, as only it finds a Playwright installed globally (NODE_PATH)
const { chromium } = createRequire(import.meta.url)('playwright');

const REPO = resolve(import.meta.dirname, '../..');
const OUT = process.argv[2] ?? join(REPO, 'apps/web/games/kit-luy/assets/screenshots');
const PAGE = '/tools/kit-luy-key-art/key-art.html';
const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
};

const SHOTS = [
  { file: 'banner.jpg', width: 960, height: 540 },
  { file: 'poster.jpg', width: 360, height: 780 },
];

// only the page's own folder and the game's styles and figures are served, never the rest of the repo
const SERVED = ['tools/kit-luy-key-art/', 'apps/web/games/kit-luy/'].map((root) =>
  join(REPO, root),
);

function servedPath(url) {
  const path = resolve(REPO, `.${decodeURIComponent(new URL(url, 'http://localhost').pathname)}`);

  return SERVED.some((root) => path.startsWith(root)) ? path : null;
}

async function answer(request, response) {
  try {
    const path = servedPath(request.url);
    const body = path && (await readFile(path));

    response.writeHead(body ? 200 : 404, {
      'content-type': TYPES[extname(path ?? '')] ?? 'application/octet-stream',
    });
    response.end(body || undefined);
  } catch {
    response.writeHead(404).end();
  }
}

function serve() {
  const server = createServer(answer);

  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

async function shoot(browser, origin, { file, width, height }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });

  await page.goto(`${origin}${PAGE}`);
  await page.waitForSelector('body[data-painted]');
  await page.screenshot({ path: join(OUT, file), type: 'jpeg', quality: 86 });
  await page.close();
}

const server = await serve();
const browser = await chromium.launch();
const origin = `http://127.0.0.1:${server.address().port}`;

try {
  for (const shot of SHOTS) {
    await shoot(browser, origin, shot);
  }
} finally {
  await browser.close();
  server.close();
}

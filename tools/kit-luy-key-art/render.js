import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
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

function serve() {
  const server = createServer(async (request, response) => {
    const path = normalize(
      join(REPO, decodeURIComponent(new URL(request.url, 'http://x').pathname)),
    );

    try {
      const body = await readFile(path);

      response.writeHead(200, {
        'content-type': TYPES[extname(path)] ?? 'application/octet-stream',
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });

  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

async function shoot(browser, origin, { file, width, height }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });

  await page.goto(`${origin}${PAGE}`);
  await page.waitForSelector('body[data-painted]');
  await page.evaluate('document.fonts.ready');
  await page.screenshot({ path: join(OUT, file), type: 'jpeg', quality: 86 });
  await page.close();
}

const server = await serve();
const browser = await chromium.launch();
const origin = `http://127.0.0.1:${server.address().port}`;

for (const shot of SHOTS) {
  await shoot(browser, origin, shot);
}

await browser.close();
server.close();

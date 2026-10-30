import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { GAMES_ROOT, PAGES_ROOT } from '../../../../server/src/paths.js';

const existing = (file) =>
  readFile(file).then(
    () => file,
    () => null,
  );

async function indexPagesIn(folder) {
  const entries = await readdir(folder, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name === 'index.html')
    .map((entry) => path.join(entry.parentPath, entry.name));
}

// Every page of the arcade but the arcade itself, however deep, so a page added later is found too.
export async function pagesUnderTheArcade() {
  const entries = await readdir(PAGES_ROOT, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'));
  const found = await Promise.all(
    folders.map((entry) => indexPagesIn(path.join(PAGES_ROOT, entry.name))),
  );
  return found.flat().sort();
}

export async function gamePages() {
  const entries = await readdir(GAMES_ROOT, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'));
  const pages = folders.map((entry) => path.join(GAMES_ROOT, entry.name, 'index.html'));
  return (await Promise.all(pages.map(existing))).filter(Boolean);
}

export async function stylesheetsOf(page) {
  const html = await readFile(page, 'utf8');
  const hrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(
    (match) => match[1],
  );
  const local = hrefs.filter((href) => !/^https?:/.test(href));
  return Promise.all(
    local.map(async (href) => {
      const file = path.resolve(path.dirname(page), href);
      return { file, css: await readFile(file, 'utf8') };
    }),
  );
}

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadCatalog } from '../catalog/read-catalog.js';
import { ART_FIELDS } from '../catalog/game-entry.js';

const revisionOf = async (file) =>
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex')
    .slice(0, 16);

// The art the arcade shows for each game (its card, tile and backdrop), which the arcade keeps
// offline with its own files, as the precache entries the worker is built with.
export async function catalogArtEntries({ webRoot, gamesRoot }) {
  const { games } = await loadCatalog({ gamesRoot, warn: () => {} });
  const urls = [...new Set(games.flatMap((game) => ART_FIELDS.map((field) => game[field])))];

  return Promise.all(
    urls
      .filter(Boolean)
      .map(async (url) => ({ url, revision: await revisionOf(path.join(webRoot, url)) })),
  );
}

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildCatalog } from './build-catalog.js';

export async function loadCatalog({ gamesRoot, warn = console.warn }) {
  return buildCatalog(await readCatalogRecords(gamesRoot), warn);
}

export async function readCatalogRecords(gamesRoot) {
  const folders = await listGameFolders(gamesRoot);
  return Promise.all(folders.map((folder) => readRecord(gamesRoot, folder)));
}

async function listGameFolders(gamesRoot) {
  try {
    const entries = await readdir(gamesRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function readRecord(gamesRoot, folder) {
  try {
    const text = await readFile(path.join(gamesRoot, folder, 'game.json'), 'utf8');
    return { folder, entry: JSON.parse(text) };
  } catch (error) {
    return { folder, error: describeReadError(error) };
  }
}

function describeReadError(error) {
  if (error.code === 'ENOENT') {
    return 'the file is missing';
  }
  if (error instanceof SyntaxError) {
    return `the file is not valid JSON (${error.message})`;
  }
  return error.message;
}

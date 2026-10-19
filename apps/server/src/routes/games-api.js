import { serializeCatalog } from '../catalog/build-catalog.js';
import { loadCatalog } from '../catalog/read-catalog.js';
import { sendJson } from '../http-responses.js';

export function createGamesApiHandler({ gamesRoot, warn }) {
  return async function serveGames(_request, response) {
    const catalog = await loadCatalog({ gamesRoot, warn });
    sendJson(response, { status: 200, json: serializeCatalog(catalog) });
  };
}

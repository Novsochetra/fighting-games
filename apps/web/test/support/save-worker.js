import { boot, jsonReply, realCatalogJson } from './home-harness.js';

const ANSWERS = {
  POST: (worker) => {
    worker.posts += 1;
    worker.status = { state: 'saving', done: 0, total: 4 };
  },
  DELETE: (worker) => {
    worker.removes += 1;
    worker.status = { state: 'not-saved' };
  },
  GET: () => {},
};

// The arcade's worker as it answers a game's save for offline (src/offline/game-downloads.js): GET
// looks, POST saves, DELETE removes.
export function fakeSaveWorker() {
  const worker = { status: { state: 'not-saved' }, posts: 0, removes: 0 };

  worker.answer = (method) => {
    ANSWERS[method](worker);

    return jsonReply(JSON.stringify(worker.status));
  };

  return worker;
}

// The real catalog's games (or only `ids`), with the worker answering for Steel & Dust, or for
// nothing (null) as where no worker runs
export async function bootWithSaveWorker(worker, ids = null) {
  const { games } = JSON.parse(await realCatalogJson());
  const shown = ids ? games.filter((game) => ids.includes(game.id)) : games;
  const catalog = JSON.stringify({ games: shown });
  const fetch = async (address, init) => {
    if (!/\/api\/offline\/steel-and-dust$/.test(String(address))) {
      return jsonReply(catalog);
    }

    return worker ? worker.answer(init?.method ?? 'GET') : jsonReply('Not found', 404);
  };

  return boot(fetch);
}

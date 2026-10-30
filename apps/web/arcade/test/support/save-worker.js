import { boot, dispatch, jsonReply, realCatalogJson } from './home-harness.js';

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

const isSaveAddress = (address) => /\/api\/offline\/steel-and-dust$/.test(String(address));

// The arcade's worker as it answers a game's save for offline (src/service-worker/game-downloads.js): GET
// looks, POST saves, DELETE removes.
export function fakeSaveWorker() {
  const worker = { status: { state: 'not-saved' }, posts: 0, removes: 0 };

  worker.answer = (method) => {
    ANSWERS[method](worker);

    return jsonReply(JSON.stringify(worker.status));
  };

  return worker;
}

// the real catalog's games, or only `ids`
async function catalogOf(ids) {
  const { games } = JSON.parse(await realCatalogJson());
  const shown = ids ? games.filter((game) => ids.includes(game.id)) : games;

  return JSON.stringify({ games: shown });
}

// The real catalog's games (or only `ids`), with the worker answering for Steel & Dust, or for
// nothing (null) as where no worker runs
export async function bootWithSaveWorker(worker, ids = null) {
  const catalog = await catalogOf(ids);
  const fetch = async (address, init) => {
    if (!isSaveAddress(address)) {
      return jsonReply(catalog);
    }

    return worker ? worker.answer(init?.method ?? 'GET') : jsonReply('Not found', 404);
  };

  return boot(fetch);
}

// The arcade's first open, as an installed arcade's is: the page loads before the worker has taken
// it over, so the server, which has no such address, gets the questions about Steel & Dust's save
// and answers each once the test lets it (`answerFromServer`), until the worker takes the page over
// as its install ends (`takeOver`, its clients.claim()).
export async function bootBeforeTheWorker(worker) {
  const workers = new EventTarget();
  const page = { isTakenOver: false, held: [] };
  const catalog = await catalogOf(['steel-and-dust']);
  const fetch = async (address, init) => {
    if (!isSaveAddress(address)) {
      return jsonReply(catalog);
    }

    if (page.isTakenOver) {
      return worker.answer(init?.method ?? 'GET');
    }

    return new Promise((resolve) => page.held.push(() => resolve(jsonReply('Not found', 404))));
  };

  await boot(fetch, { workers });

  return {
    answerFromServer: () => page.held.splice(0).forEach((answer) => answer()),
    takeOver() {
      page.isTakenOver = true;
      dispatch(workers, new Event('controllerchange'));
    },
  };
}

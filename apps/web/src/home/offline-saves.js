import { askSave } from './offline-save.js';

// the worker is asked again this often while a game saves
export const ASK_EVERY_MS = 500;

// One timer at a time, for the next round of asking. The home screen asks only while it shows; an
// answer that lands after it left starts nothing.
function createPoller({ setTimer, clearTimer }) {
  let timer = null;
  let stopped = false;

  return {
    poll(run) {
      if (!stopped && timer === null) {
        timer = setTimer(() => {
          timer = null;
          run();
        }, ASK_EVERY_MS);
      }
    },

    start() {
      stopped = false;
    },

    stop() {
      stopped = true;
      clearTimer(timer);
      timer = null;
    },
  };
}

// Asks the worker about each game, counting the questions: only the answer to the last one about a
// game counts, as one the server got before the worker took the page over can come back after the
// worker's.
function createAsker({ fetch, addressOf }) {
  const counts = new Map();

  return {
    // the answer, or undefined once a later question about the game has gone out
    async ask(id, method) {
      const question = (counts.get(id) ?? 0) + 1;

      counts.set(id, question);

      const status = await askSave(fetch, addressOf(id), method);

      return counts.get(id) === question ? status : undefined;
    },

    asked: () => [...counts.keys()],
  };
}

// Every game's save for offline, one status per game for the whole home screen, so the action
// row, a tile and the details sheet show the same save as it goes. A status is null until the
// worker answers, and stays null where none runs.
export function createSaveStore({ fetch, addressOf, setTimer, clearTimer }) {
  const statuses = new Map();
  const listeners = new Set();
  const asking = new Set();
  const asker = createAsker({ fetch, addressOf });
  const poller = createPoller({ setTimer, clearTimer });
  const saving = () => [...statuses].filter(([, status]) => status?.state === 'saving');
  const keepAsking = () =>
    saving().length > 0 && poller.poll(() => saving().forEach(([id]) => ask(id)));

  async function ask(id, method = 'GET') {
    const status = await asker.ask(id, method);

    if (status !== undefined) {
      statuses.set(id, status);
      listeners.forEach((listener) => listener());
      keepAsking();
    }
  }

  return {
    statusOf: (id) => statuses.get(id) ?? null,

    // asks once for a game shown with no status yet
    look(id) {
      if (!statuses.has(id) && !asking.has(id)) {
        asking.add(id);
        ask(id).finally(() => asking.delete(id));
      }
    },

    refresh: (id) => ask(id),
    // every game asked about, one whose first answer is still on its way too
    refreshAll: () => asker.asked().forEach((id) => ask(id)),
    save: (id) => ask(id, 'POST'),
    remove: (id) => ask(id, 'DELETE'),

    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },

    start() {
      poller.start();
      keepAsking();
    },

    stop: poller.stop,
  };
}

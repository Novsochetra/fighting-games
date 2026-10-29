import { completeGame, downloadGame, removeGame } from './game-cache.js';

const json = (answer) =>
  new Response(JSON.stringify(answer), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Each game's download running in this worker, shared by a save and by a play keeping a saved game
// fresh, so a game never comes down twice at once. One that failed stays to say so until the next
// try; one the player removes stops and is forgotten.
export function createDownloads() {
  const downloads = new Map();

  return {
    play(context, id) {
      const running = downloads.get(id);

      if (running && !running.progress.failed) {
        return running.finished;
      }

      const progress = { done: 0, total: 0, failed: false, removed: false };
      const entry = { progress };

      const untilQuiet = () => context.activity.untilQuiet(id);

      entry.finished = downloadGame({ ...context, id, progress, untilQuiet }).then(
        () => downloads.get(id) === entry && downloads.delete(id),
        () => {
          progress.failed = true;
        },
      );
      downloads.set(id, entry);

      return entry.finished;
    },

    remove(id) {
      const running = downloads.get(id);

      if (running) {
        running.progress.removed = true;
        downloads.delete(id);
      }
    },

    progressOf: (id) => downloads.get(id)?.progress,
  };
}

// What the arcade hears about a game: saved once a whole revision is kept, else how many of its
// files are in, or that its download failed, or that it is not saved.
async function saveStatus(context, id) {
  if (await completeGame({ ...context, id })) {
    return { state: 'saved' };
  }

  const progress = context.downloads.progressOf(id);

  if (!progress) {
    return { state: 'not-saved' };
  }

  return progress.failed
    ? { state: 'failed' }
    : { state: 'saving', done: progress.done, total: progress.total };
}

async function removeSave(context, id) {
  context.downloads.remove(id);
  await removeGame({ ...context, id });

  return json({ state: 'not-saved' });
}

// Only the player's own taps save (POST) or remove (DELETE) a game: looking (GET) never spends the
// player's data, and a removed game stays removed.
export async function saveResponse(event, context, id) {
  const { method } = context.request;

  if (method === 'DELETE') {
    return removeSave(context, id);
  }

  const status = await saveStatus(context, id);

  if (method === 'POST' && status.state !== 'saved') {
    event.waitUntil(context.downloads.play(context, id));

    return json(await saveStatus(context, id));
  }

  return json(status);
}

// A play keeps a saved game fresh, bringing a deploy's revision down behind the one it plays, and
// saves nothing the player has not saved.
export async function keepSavedFresh(context, id) {
  if (await completeGame({ ...context, id })) {
    await context.downloads.play(context, id);
  }
}

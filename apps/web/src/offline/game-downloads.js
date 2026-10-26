import { completeGame, downloadGame } from './game-cache.js';

const json = (answer) =>
  new Response(JSON.stringify(answer), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Each game's download running in this worker, shared by the play that started it and by the
// game's loading screen, so a game never comes down twice at once. One that failed stays to say so
// until the next play tries again; the loading screen asking again would only fail again.
export function createDownloads() {
  const downloads = new Map();

  return {
    play(context, id) {
      const running = downloads.get(id);

      if (running && !running.progress.failed) {
        return running.finished;
      }

      const progress = { done: 0, total: 0, failed: false };
      const finished = downloadGame({ ...context, id, progress }).then(
        () => downloads.delete(id),
        () => {
          progress.failed = true;
        },
      );

      downloads.set(id, { progress, finished });

      return finished;
    },

    has: (id) => downloads.has(id),
    progressOf: (id) => downloads.get(id).progress,
  };
}

// What the game's loading screen hears: ready once a whole revision is kept, else how many of its
// files are in. The browser stops a worker left idle, and its downloads with it, so asking starts
// one again when none runs.
export async function progressResponse(event, context, id) {
  if (await completeGame({ ...context, id })) {
    return json({ ready: true });
  }

  const { downloads } = context;

  if (!downloads.has(id)) {
    event.waitUntil(downloads.play(context, id));
  }

  const { done, total, failed } = downloads.progressOf(id);

  return json({ ready: false, done, total, failed });
}

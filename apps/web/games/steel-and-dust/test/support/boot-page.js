import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startLoading } from '../../src/boot/start-loading.js';
import { createLateImages } from './late-images.js';

// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
export const PAGE = readFileSync(join(import.meta.dirname, '../../index.html'), 'utf8');

// a clock whose timers fire only when the test moves it on
function createTestClock() {
  let now = 1000;
  const timers = [];
  return {
    now: () => now,
    setTimeout: (callback, ms) => timers.push({ at: now + ms, callback }),
    advance(ms) {
      now += ms;
      const due = timers.filter(({ at }) => at <= now);
      due.forEach((timer) => timers.splice(timers.indexOf(timer), 1));
      due.forEach(({ callback }) => callback());
    },
  };
}

export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

// the arcade's worker as the game's loading screen hears it: `answer` is what it says next about
// keeping the game for offline, null for an address nothing answers (the game outside the arcade)
export function fakeArcadeWorker(answer) {
  const worker = { answer, asked: 0 };
  worker.fetch = async () => {
    worker.asked += 1;
    return worker.answer === null
      ? new Response('Not found', { status: 404 })
      : new Response(JSON.stringify(worker.answer));
  };
  return worker;
}

// the page as it first paints, with the boot started on images, a font and a clock the test drives
export function openBootPage({ fontLoads = Promise.resolve([]), fetch } = {}) {
  document.body.innerHTML = PAGE.match(/<body>([\s\S]*)<\/body>/)[1];
  const images = createLateImages();
  const clock = createTestClock();
  const fonts = { load: () => fontLoads };
  function BootImage() {
    return images.createImage();
  }
  const window = {
    document: { getElementById: (id) => document.getElementById(id), fonts },
    Image: BootImage,
    setTimeout: clock.setTimeout,
    performance: { now: clock.now },
    fetch,
  };
  const boot = startLoading(window);
  const loader = document.getElementById('loader');
  // one frame of the game's loop: the clock moves on and the loading screen is told what waits
  const frame = (ms, scene = null) => {
    clock.advance(ms);
    boot.loader.update(clock.now(), scene);
  };
  return { boot, images, clock, loader, frame };
}

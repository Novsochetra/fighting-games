import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { boot } from '../../src/app/boot.js';
import { stubCanvases } from './fake-context.js';

// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
const PAGE = readFileSync(join(import.meta.dirname, '../../index.html'), 'utf8');
const FRAME_MS = 16;
const ENGLISH = { sound: true, music: true, vibrate: true, lang: 'en', numerals: 'latin' };

function driver(frames) {
  const step = (ms = FRAME_MS) => {
    frames.now += ms;
    frames.next(frames.now);
  };

  return {
    step,

    // lets the game run on for a while, a frame at a time
    wait(ms) {
      for (let elapsed = 0; elapsed < ms; elapsed += FRAME_MS) {
        step();
      }
    },
  };
}

const pointerDown = (element) =>
  element.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, button: 0 }));

// The game's own page, booted as a browser boots it, on canvases that only remember, with frames
// that come when the test steps them. It opens in English unless `settings` says otherwise.
export function openPage({ records, settings = {} } = {}) {
  const frames = { now: 0, next: null };

  document.body.innerHTML = PAGE.match(/<body>([\s\S]*)<\/body>/)[1];
  stubCanvases(window);
  window.localStorage.clear();
  window.localStorage.setItem(
    'kit_luy',
    JSON.stringify({ records, settings: { ...ENGLISH, ...settings } }),
  );
  window.requestAnimationFrame = (callback) => {
    frames.next = callback;
  };

  const { game, stage } = boot(window);
  const page = driver(frames);
  const keys = () => [...document.querySelectorAll('.answer')];

  page.step(0);

  return {
    ...page,
    game,
    stage,
    keys,
    text: (id) => document.getElementById(id).textContent,
    click: (selector) => document.querySelector(selector).click(),
    press: (index) => pointerDown(keys()[index]),
    pressRight: () => pointerDown(keys()[game.run.question.correctIndex]),
    pressWrong: () => pointerDown(keys()[(game.run.question.correctIndex + 1) % 4]),
    typeKey: (code) => window.dispatchEvent(new window.KeyboardEvent('keydown', { code })),
    saved: () => JSON.parse(window.localStorage.getItem('kit_luy')),
    screen: () => document.getElementById('app').dataset.view,
    openMenu: () => document.querySelector('.menu.open')?.id ?? null,

    // through the countdown to the first question
    play() {
      document.querySelector('#m-title [data-act="play"]').click();
      page.wait(2400);
    },
  };
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { boot } from '../../src/app/boot.js';
import { piecesFor } from '../../src/sim/pieces.js';

// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
const PAGE = readFileSync(join(import.meta.dirname, '../../index.html'), 'utf8');
const FRAME_MS = 16;
const ENGLISH = { sound: true, vibrate: true, lang: 'en', numerals: 'latin', total: 'early' };

function driver(frames) {
  const step = (ms = FRAME_MS) => {
    frames.now += ms;
    frames.next(frames.now);
  };

  return {
    step,

    wait(ms) {
      for (let elapsed = 0; elapsed < ms; elapsed += FRAME_MS) {
        step();
      }
    },
  };
}

const press = (element) =>
  element.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, button: 0 }));

function hands(game) {
  const bundle = (value) => document.querySelector(`.bundle[data-value="${value}"]`);
  const front = () => game.run.queue[0].question;

  return {
    bundle,
    deal: (value) => press(bundle(value)),
    take: (value) => press(document.querySelector(`.pile[data-value="${value}"]`)),
    give: () => press(document.getElementById('give')),
    front,

    // counts the front bill's answer out in the fewest pieces, without giving it
    count(amount = front().answer) {
      piecesFor(amount, game.run.pieces).forEach((value) => press(bundle(value)));
    },
  };
}

// The game's own page, booted as a browser boots it, with frames that come when the test steps
// them. It opens in English with Latin numerals unless `settings` says otherwise.
export function openPage({ records, settings = {} } = {}) {
  const frames = { now: 0, next: null };

  document.body.innerHTML = PAGE.match(/<body>([\s\S]*)<\/body>/)[1];
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
  const counter = hands(game);

  page.step(0);

  return {
    ...page,
    ...counter,
    game,
    stage,
    text: (id) => document.getElementById(id).textContent,
    click: (selector) => document.querySelector(selector).click(),
    typeKey: (code) => window.dispatchEvent(new window.KeyboardEvent('keydown', { code })),
    saved: () => JSON.parse(window.localStorage.getItem('kit_luy')),
    view: () => document.getElementById('app').dataset.view,
    openMenu: () =>
      document.getElementById('menus').classList.contains('is-down')
        ? document.querySelector('.menu.open').id
        : null,

    // pays the bill in front, and waits for the next one to be torn off the pad
    serve() {
      counter.count();
      counter.give();
      page.wait(320);
    },
  };
}

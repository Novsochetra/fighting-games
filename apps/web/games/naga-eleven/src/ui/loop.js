import { TICK_MS } from '../config.js';

// after a stall (a tab away, a slow frame) the match goes on from where it was, not in a rush
const MOST_BEHIND_MS = 250;

// the match steps at a steady 60 a second whatever the screen's rate; each frame draws once
export function startLoop(window, { step, draw }) {
  let last = null;
  let behind = 0;

  const frame = (now) => {
    behind = last === null ? 0 : Math.min(behind + now - last, MOST_BEHIND_MS);
    last = now;

    while (behind >= TICK_MS) {
      step();
      behind -= TICK_MS;
    }

    draw();
    window.requestAnimationFrame(frame);
  };

  window.requestAnimationFrame(frame);
}

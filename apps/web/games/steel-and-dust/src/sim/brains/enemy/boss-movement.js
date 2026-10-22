import { standStill, walk } from './movement.js';

const FEINT_TICKS = 12;

// a duelist keeps a sword's length and a step away: he backs off a hero who crowds him, closes on
// one who keeps away, and in between stands his ground or feints a step in
function duelist(boss, { distance, pace }) {
  const ai = boss.ai;
  if (distance > 96) {
    walk(boss, 1, pace);
  } else if (distance < 44) {
    walk(boss, -1, 0.8 * pace);
  } else if (ai.feint > 0) {
    ai.feint--;
    walk(boss, 1, 1.6 * pace);
  } else if (Math.random() < 0.02) {
    ai.feint = FEINT_TICKS;
  } else {
    standStill(boss);
  }
}

// a bulldozer walks at the hero and never steps back, only stopping once in reach
function bulldozer(boss, { distance, pace }) {
  if (distance > 40) {
    walk(boss, 1, pace);
  } else {
    standStill(boss);
  }
}

// a bull keeps room to run: he backs off a hero who comes close, closes on one far away and
// otherwise stands pawing the ground
function bull(boss, { distance, pace }) {
  if (distance > 170) {
    walk(boss, 1, pace);
  } else if (distance < 70) {
    walk(boss, -1, 0.7 * pace);
  } else {
    standStill(boss);
  }
}

export const BOSS_MOVEMENT = { duelist, bulldozer, bull };

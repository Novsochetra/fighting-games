import { addEffect } from './effect-list.js';

// a sharp turn at speed throws up dust: the run before and after this fast, the way turned this
// far (the cosine between the two)
const TURN = { speed: 1.7, cosine: 0.2, rest: 18 };
const SLIDE_EVERY = 4;

function watchOf(effects, count) {
  if (!effects.watch || effects.watch.count !== count) {
    effects.watch = {
      count,
      vx: new Float32Array(count),
      vy: new Float32Array(count),
      rest: new Int16Array(count),
    };
  }

  return effects.watch;
}

function isSharpTurn(watch, player) {
  const before = Math.hypot(watch.vx[player.index], watch.vy[player.index]);
  const now = Math.hypot(player.vx, player.vy);

  if (before < TURN.speed || now < TURN.speed || watch.rest[player.index] > 0) {
    return false;
  }

  const cosine =
    (watch.vx[player.index] * player.vx + watch.vy[player.index] * player.vy) / (before * now);

  return cosine < TURN.cosine;
}

function dustAt(effects, match, player) {
  addEffect(effects, {
    kind: 'dust',
    x: player.x,
    y: player.y,
    drift: -Math.sign(player.vx),
    born: match.tick,
    seed: match.tick * 31 + player.index,
  });
}

export function effectsFromPlayers(effects, match) {
  const watch = watchOf(effects, match.players.length);

  for (const player of match.players) {
    const slides = player.tackle > 0 && (match.tick + player.index) % SLIDE_EVERY === 0;
    const turns = isSharpTurn(watch, player);

    if (slides || turns) {
      dustAt(effects, match, player);
      watch.rest[player.index] = TURN.rest;
    }

    watch.rest[player.index] = Math.max(0, watch.rest[player.index] - 1);
    watch.vx[player.index] = player.vx;
    watch.vy[player.index] = player.vy;
  }
}

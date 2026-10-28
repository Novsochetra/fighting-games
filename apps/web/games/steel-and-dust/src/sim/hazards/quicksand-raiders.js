import { COLORS } from '../../art/colors.js';
import { QUICKSAND } from '../../data/quicksand.js';
import { clamp } from '../../lib/math.js';
import { knockOut } from '../combat/knock-out.js';
import { addFloatText } from '../fx/effects.js';
import { addDust } from '../fx/particles.js';
import { letGo, patchAt, standsIn, wade } from './quicksand-patch.js';

// off its feet in the sand: staggered, knocked down or getting up, or thrown and just landed
const KNOCKED = new Set(['hurt', 'down', 'getup', 'juggle']);
// on the move, its feet never settle into the sand
const STRIDING = new Set(['walk', 'run', 'dash']);
const HELD_REACH = QUICKSAND.halfWidth + 6;
const STRUGGLE_EVERY = 10;

const sinkStep = (raider) => QUICKSAND.raiderSink * raider.scale;
const swallowed = (raider) => raider.sunk >= QUICKSAND.raiderHeight * raider.scale;

// its purse is left on the rim nearer where it went down, rolling away from the sand
function leaveOnRim(pieces, patch, x) {
  const side = x < patch.x ? -1 : 1;
  const rimX = patch.x + side * (QUICKSAND.halfWidth + QUICKSAND.rimOut);

  for (const piece of pieces) {
    Object.assign(piece, { x: rimX, y: patch.y - 1, vx: side * Math.abs(piece.vx) });
  }
}

function swallow(game, patch, raider) {
  const spilled = game.loot.length;

  knockOut(game, raider, raider.facing);
  leaveOnRim(game.loot.slice(spilled), patch, raider.x);
  game.score += QUICKSAND.swallowBonus;
  addFloatText(game, { x: raider.x, y: patch.y - 30, text: 'Swallowed!', color: COLORS.gold });
  addDust(game, { x: raider.x, y: patch.y, count: 10 });
  game.io.sfx('dig', false, { x: raider.x });
  raider.removed = true;
}

// the sand holds it where it is, on its feet and staggered, and every blow it takes there lands
// without throwing it out: it can only sink
function hold(game, patch, raider) {
  const reach = QUICKSAND.halfWidth - 2;
  const caught = !raider.sunk;

  Object.assign(raider, {
    state: 'hurt',
    stateTime: Math.max(raider.stateTime, 2),
    x: clamp(raider.x, patch.x - reach, patch.x + reach),
    y: patch.y,
    vx: 0,
    vy: 0,
    airborne: false,
    sunk: (raider.sunk ?? 0) + sinkStep(raider),
  });
  if (caught) {
    game.io.sfx('dig', false, { x: raider.x });
  }

  if (caught || game.tickCount % STRUGGLE_EVERY === 0) {
    addDust(game, { x: raider.x, y: patch.y, count: caught ? 6 : 2 });
  }

  if (swallowed(raider)) {
    swallow(game, patch, raider);
  }
}

// a body knocked out on the sand goes down into it rather than lying on it
function sinkBody(raider) {
  raider.sunk = (raider.sunk ?? 0) + sinkStep(raider);
  if (swallowed(raider)) {
    raider.removed = true;
  }
}

// on its feet a raider wades through, but every moment it stands still it settles further in,
// a little dust kicked up over the last of it as warning, until the sand holds it; walking on
// does not pull its feet back out, only leaving the sand does
function settle(game, patch, raider) {
  wade(raider);
  if (STRIDING.has(raider.state)) {
    return;
  }

  raider.mired = (raider.mired ?? 0) + 1;
  if (raider.mired >= QUICKSAND.mire) {
    hold(game, patch, raider);
  } else if (raider.mired > QUICKSAND.mire / 2 && raider.mired % STRUGGLE_EVERY === 0) {
    addDust(game, { x: raider.x, y: patch.y, count: 1 });
  }
}

function leave(raider) {
  letGo(raider);
  if (raider.mired) {
    raider.mired = 0;
  }
}

// knocked off its feet in the sand, or standing still in it too long, a raider is held there
export function sinkRaider(game, raider) {
  const held = raider.sunk > 0 && raider.state !== 'ko';
  const patch = patchAt(game.quicksand, raider.x, held ? HELD_REACH : QUICKSAND.halfWidth);

  if (patch && held) {
    hold(game, patch, raider);
  } else if (!patch || !standsIn(patch, raider)) {
    leave(raider);
  } else if (raider.state === 'ko') {
    sinkBody(raider);
  } else if (KNOCKED.has(raider.state)) {
    hold(game, patch, raider);
  } else {
    settle(game, patch, raider);
  }
}

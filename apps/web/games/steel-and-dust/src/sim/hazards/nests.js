import { NEST } from '../../data/nests.js';
import { overlaps } from '../combat/boxes.js';
import { addDust } from '../fx/particles.js';
import { releaseSwarm, updateSwarm } from './hornets.js';

// a raider tumbling from a launch or a juggle, or knocked out in the air, carries up into the nest
const TUMBLING = new Set(['juggle', 'ko']);

export function createNests(nests) {
  return nests.map(({ x, y }) => ({
    x,
    y,
    state: 'hanging',
    time: 0,
    drop: 0,
    vy: 0,
    swarm: null,
  }));
}

// the nest's papery body where it hangs, or as far as it has fallen
export function nestBox(nest) {
  const bottom = nest.y - NEST.hang + nest.drop;

  return {
    x: nest.x - NEST.halfWidth,
    y: bottom - NEST.height,
    width: NEST.halfWidth * 2,
    height: NEST.height,
  };
}

function strike(game, nest) {
  Object.assign(nest, { state: 'struck', time: 0 });
  game.io.sfx('break', false, { x: nest.x, vol: 0.45 });
}

// the hero's blows, slash waves and shockwaves knock down a nest they reach
export function knockNestsIn(game, area) {
  for (const nest of game.nests) {
    if (nest.state === 'hanging' && overlaps(area, nestBox(nest))) {
      strike(game, nest);
    }
  }
}

// the body of a raider in the air, measured the same whether it tumbles or is knocked out
function tumblingBody(fighter) {
  const scale = fighter.scale;

  return {
    x: fighter.x - 8 * scale,
    y: fighter.y - 26 * scale,
    width: 16 * scale,
    height: 24 * scale,
  };
}

function struckByTumbling(game, nest) {
  const box = nestBox(nest);

  return game.fighters.some(
    (fighter) =>
      fighter.side === 'enemy' &&
      fighter.airborne &&
      TUMBLING.has(fighter.state) &&
      overlaps(box, tumblingBody(fighter)),
  );
}

function breakOpen(game, nest) {
  Object.assign(nest, { state: 'broken', time: 0, drop: NEST.hang, vy: 0 });
  addDust(game, { x: nest.x, y: nest.y, count: 8 });
  game.io.sfx('break', false, { x: nest.x });
  releaseSwarm(game, nest);
}

function fall(game, nest) {
  nest.vy += NEST.gravity;
  nest.drop += nest.vy;
  if (nest.drop >= NEST.hang) {
    breakOpen(game, nest);
  }
}

function sway(_game, nest) {
  if (++nest.time >= NEST.sway) {
    Object.assign(nest, { state: 'falling', time: 0 });
  }
}

function hang(game, nest) {
  if (struckByTumbling(game, nest)) {
    strike(game, nest);
  }
}

const UPDATES = { hanging: hang, struck: sway, falling: fall, broken: updateSwarm };

export function updateNests(game) {
  for (const nest of game.nests) {
    UPDATES[nest.state](game, nest);
  }
}

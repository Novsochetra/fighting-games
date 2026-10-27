import { KEG } from '../../data/kegs.js';
import { overlaps } from '../combat/boxes.js';
import { blastArea, blowKeg } from './keg-blast.js';

// a body tumbling from a hit, or falling knocked out, carries far enough to light a keg it meets
const THROWN = new Set(['juggle', 'ko']);
const THROWN_SPEED = 1;

export function createKegs(kegs) {
  return kegs.map(({ x, y }) => ({ x, y, fuse: 0, lit: false, gone: false }));
}

export function kegBox(keg) {
  return {
    x: keg.x - KEG.halfWidth,
    y: keg.y - KEG.height,
    width: KEG.halfWidth * 2,
    height: KEG.height,
  };
}

// a lit keg only ever burns faster, never slower
export function lightKeg(game, keg, fuse = KEG.fuse) {
  if (keg.gone || (keg.lit && keg.fuse <= fuse)) {
    return;
  }
  const first = !keg.lit;
  Object.assign(keg, { lit: true, fuse });
  if (first) {
    game.io.sfx('sizzle', false, { x: keg.x });
  }
}

// the hero's blows, slash waves and shockwaves light a keg they reach
export function lightKegsIn(game, area) {
  for (const keg of game.kegs) {
    if (!keg.lit && !keg.gone && overlaps(area, kegBox(keg))) {
      lightKeg(game, keg);
    }
  }
}

function thrownBody(fighter) {
  return {
    x: fighter.x - 8,
    y: fighter.y - 22 * fighter.scale,
    width: 16,
    height: 22 * fighter.scale,
  };
}

function struckByThrown(game, keg) {
  const box = kegBox(keg);
  return game.fighters.some(
    (fighter) =>
      fighter.side === 'enemy' &&
      THROWN.has(fighter.state) &&
      Math.abs(fighter.vx) > THROWN_SPEED &&
      overlaps(box, thrownBody(fighter)),
  );
}

function chain(game, keg) {
  const area = blastArea(keg);
  for (const other of game.kegs) {
    if (other !== keg && !other.gone && overlaps(area, kegBox(other))) {
      lightKeg(game, other, KEG.chainFuse);
    }
  }
}

export function updateKegs(game) {
  for (const keg of game.kegs) {
    if (keg.gone) {
      continue;
    }
    if (struckByThrown(game, keg)) {
      lightKeg(game, keg, KEG.thrownFuse);
    }
    if (keg.lit && --keg.fuse <= 0) {
      blowKeg(game, keg);
      chain(game, keg);
    }
  }
}

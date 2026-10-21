import { EMBER_SPEAR_TIPS } from '../../data/ember-spear-tips.js';
import { fxLength } from '../../data/fx-sprites.js';
import { HERO_MOVE_SPRITES } from '../../data/hero-sprites.js';
import { clamp } from '../../lib/math.js';
import { floorUnder } from '../fighters/terrain-motion.js';

const LANCE_SCALE = 0.8;
// world px from the tip to where the feathers fall at scale 1
const LANCE_LENGTH = 36;
const SHORTEST = 0.3;

// the tip of the spear as the move's strike frame holds it, and the way it points in radians
export function spearTipOf(move) {
  const [strip] = move.sprite || HERO_MOVE_SPRITES[move.id] || ['slash1'];
  const { x, y, aim } = EMBER_SPEAR_TIPS[strip] || EMBER_SPEAR_TIPS.slash1;
  return { x, y, angle: (aim * Math.PI) / 180 };
}

// a lance aimed down stops at the floor instead of pouring into the earth
export function lanceScale(floorY, tipY, angle) {
  const drop = Math.sin(angle) * LANCE_LENGTH * LANCE_SCALE;
  if (drop <= 0) {
    return LANCE_SCALE;
  }
  return LANCE_SCALE * clamp((floorY - tipY) / drop, SHORTEST, 1);
}

function followOwner(lance) {
  const { owner, tip } = lance;
  lance.x = owner.x + owner.facing * tip.x;
  lance.y = owner.y + tip.y;
  lance.direction = owner.facing;
}

// phoenix fire pours from the spear tip and bursts into feathers; a look only, the spear does the hitting
export function thrustLance(game, fighter, move) {
  const tip = spearTipOf(move);
  const lance = {
    kind: 'lance',
    sprite: 'lance',
    owner: fighter,
    move,
    tip,
    angle: tip.angle,
    time: 0,
  };
  followOwner(lance);
  lance.scale = lanceScale(floorUnder(game.terrain, fighter), lance.y, tip.angle);
  game.summons.push(lance);
  game.io.sfx('ignite');
}

// a level or rising lance rides along with a lunging strike; it stays put once the move is over, and a
// lance aimed down stays put at once so a dive does not drive it into the floor it was cut short for
export function updateLance(_game, lance) {
  if (lance.owner.move === lance.move && lance.angle <= 0) {
    followOwner(lance);
  }
  lance.done = lance.time >= fxLength('lance');
}

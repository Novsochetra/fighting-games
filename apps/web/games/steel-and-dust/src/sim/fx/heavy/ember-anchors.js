import { HERO_MOVE_SPRITES } from '../../../data/hero-sprites.js';
import { heroAnimation } from '../../hero-animation.js';
import { fxRandom } from '../fx-random.js';
import { bladeTipOf, chestOf } from './default-kit.js';
import { BACK, FACES, HANDS, SMEARS, SPIN_RING } from './ember-sprite-points.js';

function placed(fighter, [dx, dy]) {
  return { x: fighter.x + dx * fighter.facing, y: fighter.y + dy };
}

function rigHand(fighter) {
  return fighter.joints ? fighter.joints.frontHand : chestOf(fighter);
}

// the Shade's hands in the frame it is drawn in now
export function handOf(fighter) {
  const [name, frame] = heroAnimation(fighter);
  const hands = HANDS[name];
  return hands ? placed(fighter, hands[Math.min(frame, hands.length - 1)]) : rigHand(fighter);
}

// where its hands are coiled in the last frame before the strike, where the gathered fire meets
export function coilOf(fighter, move) {
  const [name, strike] = move.sprite || HERO_MOVE_SPRITES[move.id] || [];
  const hands = HANDS[name];
  return hands ? placed(fighter, hands[Math.max(0, strike - 1)]) : handOf(fighter);
}

function alongLine(game, points) {
  const reach = fxRandom(game) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(reach));
  const share = reach - index;
  const [from, to] = [points[index], points[index + 1]];
  return [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];
}

// a point somewhere along the smear the strike draws, for the fire it sheds; the spin's ring turns
export function smearPointOf(game, fighter, time) {
  const [name] = heroAnimation(fighter);
  if (name === 'spin_slash') {
    const angle = -time * 0.9;
    const dx = SPIN_RING.x + Math.cos(angle) * SPIN_RING.radius;
    return placed(fighter, [dx, SPIN_RING.y + Math.sin(angle) * SPIN_RING.radius]);
  }
  const smear = SMEARS[name];
  return smear ? placed(fighter, alongLine(game, smear)) : bladeTipOf(fighter);
}

// the Shade's face in the strip it is drawn in now, or near enough where none is measured
export function faceOf(fighter) {
  const [name] = heroAnimation(fighter);
  return placed(fighter, FACES[name] ?? [2, -26]);
}

export function backOf(fighter) {
  return placed(fighter, BACK);
}

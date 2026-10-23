import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { bodyPoint, bodySize } from '../fighters/body-point.js';
import { addFloatText } from '../fx/effects.js';
import { addBurst } from '../summons/bursts.js';

// her eyes and the flash's size, in her own units (body-point.js)
const EYES = { ahead: 5, up: 42 };
const FLASH_SIZE = 1;
const STARS_EVERY = 16;
const CAN_BE_HELD = new Set(['idle', 'walk', 'run', 'dash', 'attack', 'hurt', 'squat', 'charge']);

const eyesOf = (boss) => bodyPoint(boss, EYES);

// a hero looking at her is one who faces her: walking away turns the hero round and breaks it
export function meetsGaze(boss, hero, reach) {
  const toward = Math.sign(boss.x - hero.x) || hero.facing;
  return (
    hero.facing === toward &&
    Math.abs(boss.x - hero.x) <= reach &&
    !hero.airborne &&
    !(hero.invincible > 0) &&
    CAN_BE_HELD.has(hero.state)
  );
}

export function warnOfGaze(game, boss) {
  const hero = game.player;
  const color = BOSS_ULT_COLORS[boss.kind].title;
  addFloatText(game, { x: hero.x, y: hero.y - 48, text: 'Look away!', color });
}

// the flash goes off from her eyes; a hero who meets it stands held, stars round their head
export function flashGaze(game, boss, move) {
  const { stun, reach } = move.gaze;
  addBurst(game, { sprite: 'hypnosis', ...eyesOf(boss), scale: bodySize(boss, FLASH_SIZE) });
  game.io.sfx('hypnosis', false, { x: boss.x });
  const hero = game.player;
  boss.ai.heldByGaze = meetsGaze(boss, hero, reach);
  if (!boss.ai.heldByGaze) {
    return;
  }
  hero.move = null;
  hero.hitboxActive = false;
  hero.trail.length = 0;
  Object.assign(hero, { state: 'hurt', stateTime: stun, vx: 0 });
  addBurst(game, { sprite: 'hypnosis', x: hero.x, y: hero.y - 40, scale: 0.5 });
}

export const whileHeld = (move, time) =>
  Boolean(move.gaze) &&
  time > move.gaze.flashAt &&
  time < move.gaze.flashAt + move.gaze.stun &&
  (time - move.gaze.flashAt) % STARS_EVERY === 0;

export function circleHeldHero(game, boss) {
  const hero = game.player;
  if (boss.ai.heldByGaze && hero.state === 'hurt') {
    addBurst(game, { sprite: 'stars', x: hero.x, y: hero.y - 38, scale: 1 });
  }
}

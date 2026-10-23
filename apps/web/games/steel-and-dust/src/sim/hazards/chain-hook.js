import { activeEnd } from '../../data/moves/define-move.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { canBeHit } from '../combat/guard.js';
import { bodyPoint } from '../fighters/body-point.js';
import { groundAt } from '../stage/terrain.js';
import { FIST_ON_FRAME, fistOf } from './chain-fist.js';
import { dragIn, grab, holdHero, letGo } from './chain-pull.js';

// it flies at a hero's waist, in pixels off the ground, low enough to jump as it comes
const AIM = 12;
const HOOK_SPEED = 7;
const REEL_SPEED = 9;
// as far as the hook flies from his fist; the move's lane (ox-moves.js) runs this far past it
const REACH = 196;

export const hookArea = (hook) => ({ x: hook.x - 5, y: hook.y - 5, width: 10, height: 10 });

// the hook leaves his fist for the hero's waist where the hero stands as he throws
export function throwHook(game, boss, move) {
  const fist = bodyPoint(boss, FIST_ON_FRAME[3]);
  const hero = game.player;
  const dx = Math.max(24, Math.abs(hero.x - fist.x));
  const dy = hero.y - AIM - fist.y;
  const length = Math.hypot(dx, dy);
  game.projectiles.push({
    kind: 'chainHook',
    x: fist.x,
    y: fist.y,
    vx: (boss.facing * HOOK_SPEED * dx) / length,
    vy: (HOOK_SPEED * dy) / length,
    direction: boss.facing,
    speed: 0,
    owner: boss,
    chop: move.hook.chop,
    state: 'out',
    side: boss.side,
    time: 0,
    damage: 0,
    hitTargets: new Set(),
  });
  game.io.sfx('chainHook', false, { x: boss.x, dir: boss.facing });
}

function stepToward(hook, to, speed) {
  const dx = to.x - hook.x;
  const dy = to.y - hook.y;
  const gap = Math.hypot(dx, dy);
  const step = Math.min(speed, gap);
  hook.x += gap ? (dx / gap) * step : 0;
  hook.y += gap ? (dy / gap) * step : 0;
  return gap <= speed;
}

function catches(game, hook) {
  const hero = game.player;
  const body = hurtBox(hero);
  return Boolean(body) && canBeHit(hero, {}) && overlaps(hookArea(hook), body);
}

function flyOut(game, hook) {
  hook.x += hook.vx;
  hook.y += hook.vy;
  if (catches(game, hook)) {
    grab(game, hook);
    return;
  }
  const fist = fistOf(hook.owner);
  const far = Math.hypot(hook.x - fist.x, hook.y - fist.y) >= REACH;
  if (far || hook.y >= groundAt(game.terrain, hook.x)) {
    hook.state = 'back';
  }
}

// a hook that missed comes back to his fist, and he stands down
function reelBack(_game, hook) {
  const boss = hook.owner;
  if (stepToward(hook, fistOf(boss), REEL_SPEED)) {
    hook.dead = true;
    boss.moveTime = activeEnd(boss.move);
  }
}

const STEPS = { out: flyOut, back: reelBack, pull: dragIn, held: holdHero };

// a boss knocked out of his throw, or of his chop before he lets go, drops the hook
const swings = (boss) => boss.state === 'attack' && Boolean(boss.move.hook || boss.move.letGoAt);

export function swingHook(game, hook) {
  if (!swings(hook.owner)) {
    letGo(game, hook);
    return;
  }
  STEPS[hook.state](game, hook);
}

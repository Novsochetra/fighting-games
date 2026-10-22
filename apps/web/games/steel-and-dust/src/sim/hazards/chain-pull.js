import { COLORS } from '../../art/colors.js';
import { startMove } from '../fighters/actions.js';
import { placeOnGround } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';

// the hook bites a hero at the chest and holds them where his chop lands (ox-moves.js): his own
// units ahead of him, and a hero's height in pixels. Its ring is drawn this far in his units short
// of the middle of its curve, which closes round the hero (warden-hazards.js)
const CHEST = 14;
const HOLD_AT = 22;
export const HOOK_SIZE = 0.7;
const HOOK_BITE = 14;
const HELD = 999;
const PULL_SPEED = 6;
// let go as he raises the axe, a hero stays reeling till the chop comes down
const LET_GO_STUN = 18;

// the ring sits on the hero's near side, so the hook's curve closes round them
function pinHook(hook, hero) {
  const toward = Math.sign(hook.owner.x - hero.x) || -hook.owner.facing;
  hook.x = hero.x + toward * HOOK_BITE * hook.owner.scale;
  hook.y = hero.y - CHEST;
}

export function grab(game, hook) {
  const hero = game.player;
  hero.move = null;
  hero.hitboxActive = false;
  hero.trail.length = 0;
  Object.assign(hero, { state: 'hurt', stateTime: HELD, vx: 0, vy: 0, airborne: false });
  hook.state = 'pull';
  addSparks(game, { x: hook.x, y: hook.y, count: 8, color: COLORS.steel, speed: 2.2 });
  shake(game, 3, 8);
  game.io.sfx('blunt', false, { x: hook.x });
}

// the hero is dragged along the ground to the spot his chop lands on
export function dragIn(game, hook) {
  const { owner: boss, chop } = hook;
  const hero = game.player;
  const gap = boss.x + boss.facing * HOLD_AT * boss.scale - hero.x;
  hero.x += Math.sign(gap) * Math.min(PULL_SPEED, Math.abs(gap));
  hero.vx = 0;
  placeOnGround(game.terrain, hero);
  pinHook(hook, hero);
  if (Math.abs(gap) <= PULL_SPEED) {
    hook.state = 'held';
    startMove(game, boss, chop);
  }
}

export function letGo(game, hook) {
  hook.dead = true;
  const hero = game.player;
  if (hook.state === 'pull' || hook.state === 'held') {
    hero.stateTime = Math.min(hero.stateTime, LET_GO_STUN);
  }
}

export function holdHero(game, hook) {
  const hero = game.player;
  hero.vx = 0;
  pinHook(hook, hero);
  if (hook.owner.moveTime >= hook.owner.move.letGoAt) {
    letGo(game, hook);
  }
}

import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { addSparks } from '../fx/particles.js';
import { strikeTarget } from './strike.js';

const COMBO_STING = { damage: 3, knockback: [0.5, -0.6], hitstop: 3, hitstun: 16 };
const HUNT = { speed: 3.6, turn: 0.12 };
const ORBIT = { speed: 2.4, turn: 0.1 };
const RETURN = { speed: 5, turn: 0.25 };

// a glowing mote that hunts a raider, stings it, darts off and comes back until its stings run out
export function releaseFirefly(game, { x, y, angle, hit, stings, target, life, owner }) {
  game.summons.push({
    kind: 'firefly',
    x,
    y,
    vx: Math.cos(angle) * 2.4,
    vy: Math.sin(angle) * 2.4,
    direction: 1,
    side: 'player',
    time: 0,
    hit,
    stings,
    target,
    life,
    owner,
    cooldown: 8,
    mode: 'hunt',
    hitTargets: new Set(),
  });
}

function isHuntable(fighter) {
  return (
    fighter.side === 'enemy' && fighter.state !== 'ko' && !fighter.removed && !fighter.entering
  );
}

function nearestRaider(game, fly) {
  let best = null;
  let bestDistance = 220;
  for (const fighter of game.fighters.filter(isHuntable)) {
    const distance = Math.hypot(fighter.x - fly.x, fighter.y - 16 - fly.y);
    if (distance < bestDistance) {
      best = fighter;
      bestDistance = distance;
    }
  }
  return best;
}

function steer(fly, { x, y }, { speed, turn }) {
  const dx = x - fly.x;
  const dy = y - fly.y;
  const distance = Math.hypot(dx, dy) || 1;
  fly.vx += ((dx / distance) * speed - fly.vx) * turn;
  fly.vy += ((dy / distance) * speed - fly.vy) * turn;
  return distance;
}

function chest(fighter) {
  return { x: fighter.x, y: fighter.y - 18 * fighter.scale };
}

function sting(game, fly) {
  strikeTarget(game, fly, { target: fly.target });
  fly.stings--;
  fly.cooldown = 14;
  fly.vx = -fly.vx * 0.9 + randomBetween(-1, 1);
  fly.vy = -randomBetween(1.6, 2.6);
}

function orbit(fly) {
  const owner = fly.owner;
  const angle = fly.time * 0.08 + fly.life;
  steer(fly, { x: owner.x + Math.cos(angle) * 28, y: owner.y - 30 + Math.sin(angle) * 14 }, ORBIT);
}

function hunt(game, fly) {
  if (!fly.target || !isHuntable(fly.target)) {
    fly.target = nearestRaider(game, fly);
  }
  if (!fly.target && fly.owner) {
    orbit(fly);
    return;
  }
  if (!fly.target) {
    fly.vx *= 0.94;
    fly.vy = fly.vy * 0.94 - 0.02;
    return;
  }
  const distance = steer(fly, chest(fly.target), HUNT);
  if (distance < 8 && fly.cooldown <= 0) {
    sting(game, fly);
  }
}

function glowTrail(game, fly) {
  if (fly.time % 2) {
    return;
  }
  game.particles.push({
    kind: 'mote',
    x: fly.x,
    y: fly.y,
    vx: 0,
    vy: 0.1,
    life: 14,
    maxLife: 14,
    color: FX_COLORS.emberGold,
  });
}

function fade(game, fly) {
  fly.done = true;
  addSparks(game, { x: fly.x, y: fly.y, count: 3, color: FX_COLORS.emberGold, speed: 1.6 });
}

export function updateFirefly(game, fly) {
  fly.cooldown--;
  if (fly.mode === 'return') {
    fly.done = steer(fly, chest(fly.owner), RETURN) < 8;
  } else {
    hunt(game, fly);
  }
  fly.x += fly.vx;
  fly.y += fly.vy;
  glowTrail(game, fly);
  if (fly.mode !== 'return' && (fly.stings <= 0 || fly.time >= fly.life)) {
    fade(game, fly);
  }
}

// a finisher looses a few fireflies from the Shade's blade, each with two stings
export function releaseComboFireflies(game, fighter, count) {
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + fighter.facing * (0.4 + (i / count) * 1.4);
    const x = fighter.x + fighter.facing * 12;
    releaseFirefly(game, { x, y: fighter.y - 26, angle, hit: COMBO_STING, stings: 2, life: 120 });
  }
  game.io.sfx('swarm', false, { x: fighter.x });
}

import { FX_COLORS } from '../../art/fx-colors.js';
import { clamp, randomBetween } from '../../lib/math.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { nudge } from '../fighters/terrain-motion.js';
import { groundAt } from '../stage/terrain.js';

// frames 0-2 of its strip grow it, 3-5 spin while it lives, 6-7 blow it away
export const DEVIL_GROW = 18;
export const DEVIL_FADE = 12;
const LIFE = 300;
const DAMAGE = 10;
const TOP_SPEED = 0.9;
const STEER = 0.025;
// it pulls slower than the hero walks, so walking away gets out; standing still does not
const PULL = 0.5;
const PULL_REACH = 72;
const BEHIND_HERO = 96;
const MARGIN = 16;

function raiseDevil(game, boss, x) {
  game.projectiles.push({
    kind: 'dustDevil',
    x,
    y: groundAt(game.terrain, x),
    direction: 1,
    speed: 0,
    vx: 0,
    side: boss.side,
    time: 0,
    endAt: LIFE,
    damage: DAMAGE,
    hitTargets: new Set(),
  });
}

// one rises in front of him; with two, the second rises on the far side of the hero
export function raiseDustDevils(game, boss, move) {
  raiseDevil(game, boss, boss.x + boss.facing * 30);
  if (move.devils > 1) {
    const { left, right } = screenEdges(game);
    const x = game.player.x + boss.facing * BEHIND_HERO;
    raiseDevil(game, boss, clamp(x, left + MARGIN, right - MARGIN));
  }
  game.io.sfx('gust', false, { x: boss.x });
}

export const isSpinning = (devil) => devil.time >= DEVIL_GROW && devil.time < devil.endAt;

function canBePulled(hero) {
  return !hero.airborne && hero.state !== 'ko' && hero.state !== 'down' && hero.hitstop === 0;
}

function pullHero(game, devil) {
  const hero = game.player;
  const dx = devil.x - hero.x;
  if (canBePulled(hero) && Math.abs(dx) < PULL_REACH && Math.abs(dx) > 4) {
    nudge(game.terrain, hero, Math.sign(dx) * PULL);
  }
}

function driftAfterHero(game, devil) {
  const target = Math.sign(game.player.x - devil.x) * TOP_SPEED;
  devil.vx += clamp(target - devil.vx, -STEER, STEER);
  const { left, right } = screenEdges(game);
  devil.x = clamp(devil.x + devil.vx, left + MARGIN, right - MARGIN);
}

function kickUpSand(game, devil) {
  const side = Math.random() < 0.5 ? -1 : 1;
  game.particles.push({
    kind: 'dust',
    x: devil.x + side * randomBetween(6, 16),
    y: devil.y - randomBetween(0, 4),
    vx: side * randomBetween(0.3, 0.9),
    vy: -randomBetween(0.2, 0.8),
    life: 18,
    maxLife: 18,
    size: 2,
    color: FX_COLORS.mirageDust,
  });
}

// it drifts after the hero and pulls them in; once it has thrown someone, or its time is up, it
// blows itself out
export function spinDustDevil(game, devil) {
  if (devil.hitTargets.size > 0 && devil.endAt > devil.time) {
    devil.endAt = devil.time;
  }
  devil.dead = devil.time >= devil.endAt + DEVIL_FADE;
  devil.y = groundAt(game.terrain, devil.x);
  if (!isSpinning(devil)) {
    return;
  }
  driftAfterHero(game, devil);
  pullHero(game, devil);
  if (devil.time % 3 === 0) {
    kickUpSand(game, devil);
  }
}

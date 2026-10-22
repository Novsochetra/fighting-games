import { FX_COLORS } from '../../art/fx-colors.js';
import { clamp } from '../../lib/math.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { arenaBounds } from '../fighters/arena-bounds.js';
import { placeOnGround } from '../fighters/terrain-motion.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';

const EDGE = 30;
const HERO_GAP = 56;
export const FIRE_EVERY = 150;

function shuffle(places) {
  for (let i = places.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [places[i], places[j]] = [places[j], places[i]];
  }
  return places;
}

// three spots across the arena, each kept a step from the hero
function spots(game, boss) {
  const { min, max } = arenaBounds(game, boss);
  const hero = game.player.x;
  return [min + EDGE, (min + max) / 2, max - EDGE].map((x) =>
    Math.abs(x - hero) < HERO_GAP ? clamp(hero + (x >= hero ? 1 : -1) * HERO_GAP, min, max) : x,
  );
}

function sandPuff(game, x) {
  const y = groundAt(game.terrain, x);
  addDust(game, { x, y, count: 6, color: FX_COLORS.mirageDust });
  addSparks(game, { x, y: y - 4, count: 6, color: FX_COLORS.sunGold, speed: 1.6 });
}

function stepOut(game, boss, x) {
  boss.x = x;
  placeOnGround(game.terrain, boss);
  boss.facing = game.player.x >= x ? 1 : -1;
  boss.vx = 0;
  boss.mirageAnchor = x;
  sandPuff(game, x);
}

export const isLive = (mirage) => mirage.popTime < 0;
export const liveMirages = (boss) => (boss.mirages ?? []).filter(isLive);
export const hasMirages = (boss) => liveMirages(boss).length > 0;

// he steps out of the sand at one of three spots and his copies at the others, so the hero cannot
// tell which he went to
export function castMirages(game, boss, move) {
  const [own, ...others] = shuffle(spots(game, boss));
  stepOut(game, boss, own);
  boss.mirages = others.slice(0, move.mirages.count).map((x, i) => {
    sandPuff(game, x);
    const fireIn = move.mirages.firing ? FIRE_EVERY / 2 + i * (FIRE_EVERY / 2) : -1;
    return { x, y: groundAt(game.terrain, x), facing: 1, time: 0, popTime: -1, fireIn, cast: -1 };
  });
  game.io.sfx('mirage', false, { x: boss.x });
}

// crowded, he leaves in sand and steps out at the end of the arena farthest from the hero; his
// copies step out at the other spots
export function blinkEndToEnd(game, boss) {
  const { min, max } = arenaBounds(game, boss);
  const far = game.player.x < (min + max) / 2 ? max - EDGE : min + EDGE;
  stepOut(game, boss, far);
  const others = spots(game, boss).filter((x) => Math.abs(x - far) > EDGE);
  liveMirages(boss).forEach((mirage, i) => {
    mirage.x = others[i % others.length];
    sandPuff(game, mirage.x);
  });
  game.io.sfx('mirage', false, { vol: 0.6, x: far });
}

export function popMirage(game, mirage) {
  mirage.popTime = 0;
  addSparks(game, {
    x: mirage.x,
    y: mirage.y - 24,
    count: 12,
    color: FX_COLORS.sunGold,
    speed: 2.4,
  });
  addDust(game, { x: mirage.x, y: mirage.y, count: 8, color: FX_COLORS.mirageDust });
  game.io.sfx('mirage', false, { vol: 0.5, x: mirage.x });
}

// a copy is only sand: any blow that reaches it pops it
export function popMiragesIn(game, attacker, area) {
  for (const boss of game.fighters) {
    for (const mirage of liveMirages(boss)) {
      const body = hurtBox({
        x: mirage.x,
        y: mirage.y,
        scale: boss.scale,
        state: 'idle',
        def: boss.def,
      });
      if (!attacker.hitTargets.has(mirage) && overlaps(area, body)) {
        attacker.hitTargets.add(mirage);
        popMirage(game, mirage);
      }
    }
  }
}

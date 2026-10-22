import { BOSS_ULT_COLORS } from '../../art/boss-colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { clamp } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { startMove } from '../fighters/actions.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText, addRing } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { raiseJar, unbrokenJars } from '../hazards/canopic-jars.js';
import { CURSE_OVER_HEAD, markCurse } from '../hazards/curse-marks.js';
import { hazardAttacker } from '../hazards/hazard-attacker.js';
import { addBurst } from '../summons/bursts.js';

const JAR_EDGE = 28;
const HERO_GAP = 40;
const CURSE_DAMAGE = 30;
const CURSE_HIT = { knockback: [2.4, -3.6], knockdown: true, hitstop: 12, hitstun: 30 };
// the sun over his raised staff (curseOfSun frames 4-7) and the orb he points at the hero (frame 9),
// in sheet pixels from his feet halved and scaled like his body
export const SUN = { ahead: 4, up: 41 };
export const POINTED_ORB = { ahead: 20, up: 18 };

// the jars stand spread across the arena, none on the hero's own spot
function jarSpots(game, count) {
  const { left, right } = screenEdges(game);
  const [min, max] = [left + JAR_EDGE, right - JAR_EDGE];
  const hero = game.player.x;
  return Array.from({ length: count }, (_, i) => {
    const x = min + ((max - min) * i) / (count - 1);
    if (Math.abs(x - hero) >= HERO_GAP) {
      return x;
    }
    const away = clamp(hero + (x >= hero ? 1 : -1) * HERO_GAP, min, max);
    return Math.abs(away - hero) >= HERO_GAP ? away : hero - (x >= hero ? 1 : -1) * HERO_GAP;
  });
}

export function castCurse(game, boss, move) {
  for (const x of jarSpots(game, move.curse.jars)) {
    raiseJar(game, boss, x);
  }
  markCurse(game, boss);
  const { player } = game;
  const color = BOSS_ULT_COLORS[boss.kind].title;
  addFloatText(game, { x: player.x, y: player.y - 64, text: 'Break the jars!', color });
  game.io.sfx('curse', false, { x: boss.x });
}

export const cursingNow = (move, time) =>
  Boolean(move.curse) && time > move.startup && time < move.curse.releaseAt;

function sunOver(boss) {
  return { x: boss.x + boss.facing * SUN.ahead * boss.scale, y: boss.y - SUN.up * boss.scale };
}

// the eye over the hero's head bursts as the curse on them breaks
function burstCurseMark(game, boss) {
  for (const mark of game.projectiles) {
    if (mark.kind === 'curseMark' && mark.owner === boss) {
      const at = { x: mark.x, y: mark.y - CURSE_OVER_HEAD };
      addRing(game, { ...at, color: FX_COLORS.sunGold });
      addSparks(game, { ...at, count: 12, color: FX_COLORS.sunGold, speed: 2.2 });
      mark.dead = true;
    }
  }
}

// every jar broken, the sun bursts over him and leaves him reeling
export function watchJars(game, boss) {
  if (unbrokenJars(game, boss).length > 0) {
    return;
  }
  const sun = sunOver(boss);
  burstCurseMark(game, boss);
  addRing(game, { ...sun, color: FX_COLORS.sunWhite, big: true });
  addSparks(game, { ...sun, count: 24, color: FX_COLORS.sunGold, speed: 3.4 });
  addFloatText(game, {
    x: boss.x,
    y: sun.y - 10,
    text: 'Curse broken!',
    color: FX_COLORS.sunWhite,
  });
  shake(game, 4, 14);
  game.io.sfx('sunBreak', false, { x: boss.x });
  startMove(game, boss, 'sunBroken');
}

export const curseReleases = (move, time) => time === move.curse?.releaseAt;

// a jar left unbroken, the sun's light falls on the cursed hero wherever they are
export function releaseCurse(game, boss) {
  if (unbrokenJars(game, boss).length === 0) {
    return;
  }
  const { player } = game;
  const orb = {
    x: boss.x + boss.facing * POINTED_ORB.ahead * boss.scale,
    y: boss.y - POINTED_ORB.up * boss.scale,
  };
  addSparks(game, { ...orb, count: 14, color: FX_COLORS.sunGold, speed: 2.6 });
  addBurst(game, { sprite: 'sunfall', x: player.x, y: floorUnder(game.terrain, player), scale: 1 });
  shake(game, 6, 20);
  game.io.sfx('sunfall', false, { x: player.x });
  const attacker = hazardAttacker({ x: boss.x, direction: boss.facing, side: boss.side }, 'none');
  const move = { damage: CURSE_DAMAGE, knockAway: true, ...CURSE_HIT };
  applyHit(game, { attacker, target: player, move, x: player.x, y: player.y - 20 });
}

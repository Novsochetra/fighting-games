import { FX_COLORS } from '../../art/fx-colors.js';
import { overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';

// frames 1-5 of the jar's strip, this many ticks each, break it; the rubble lies a while, fading
export const CRUMBLE_TICKS = 4;
const CRUMBLE_FRAMES = 5;
export const RUBBLE_FADE = 40;
const RUBBLE_GONE = CRUMBLE_FRAMES * CRUMBLE_TICKS + RUBBLE_FADE;

// the curse holds while the boss still burns the sun over his head
export function isCursing(boss) {
  const move = boss.move;
  return boss.state === 'attack' && Boolean(move?.curse) && boss.moveTime < move.curse.releaseAt;
}

export const isJarStanding = (jar) => jar.brokenAt < 0;

export function jarBox(jar) {
  return { x: jar.x - 7, y: jar.y - 26, width: 14, height: 26 };
}

export function raiseJar(game, boss, x) {
  const y = groundAt(game.terrain, x);
  game.projectiles.push({
    kind: 'canopic',
    x,
    y,
    direction: 1,
    speed: 0,
    side: boss.side,
    time: 0,
    damage: 0,
    brokenAt: -1,
    owner: boss,
    hitTargets: new Set(),
  });
  addDust(game, { x, y, count: 6, color: FX_COLORS.mirageDust });
}

// the jars the hero has not broken; those left when the curse ends crumble on their own
export function unbrokenJars(game, boss) {
  return game.projectiles.filter(
    (shot) => shot.kind === 'canopic' && shot.owner === boss && !shot.shattered,
  );
}

function crackJar(game, jar, { loud }) {
  jar.brokenAt = jar.time;
  jar.shattered = loud;
  addDust(game, { x: jar.x, y: jar.y, count: loud ? 8 : 5, color: FX_COLORS.mirageDust });
  if (!loud) {
    return;
  }
  addSparks(game, { x: jar.x, y: jar.y - 14, count: 12, color: FX_COLORS.sunGold, speed: 2.6 });
  shake(game, 2, 6);
  game.io.sfx('jarBreak', false, { x: jar.x });
}

// a jar stands till it is broken or the curse ends, then crumbles where it stood
export function standJar(game, jar) {
  if (isJarStanding(jar) && !isCursing(jar.owner)) {
    crackJar(game, jar, { loud: false });
  }
  jar.dead = !isJarStanding(jar) && jar.time - jar.brokenAt >= RUBBLE_GONE;
}

// one blow breaks a jar
export function breakJarsIn(game, area) {
  for (const jar of game.projectiles) {
    if (jar.kind === 'canopic' && isJarStanding(jar) && overlaps(area, jarBox(jar))) {
      crackJar(game, jar, { loud: true });
    }
  }
}

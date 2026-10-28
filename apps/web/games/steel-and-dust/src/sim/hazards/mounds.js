import { BURROW } from '../../data/ambush.js';
import { onScreen } from '../fighters/arena-bounds.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { spawnRaiderAt } from '../stage/spawn-enemy.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';

const MARGIN = 12;
// the earth bursting up round a raider is drawn smaller than round the Scorpion Queen
const ERUPTION_SCALE = 0.55;

// a raider under the sand: its mound starts where it digs in and works its way after the hero
export function burrowAt(game, { kind, x }) {
  const y = groundAt(game.terrain, x);

  game.projectiles.push({
    kind: 'mound',
    raiderKind: kind,
    x,
    y,
    direction: 1,
    speed: 0,
    side: 'enemy',
    time: 0,
    haltAt: 0,
    eruptAt: 0,
    damage: BURROW.eruptDamage,
    hitTargets: new Set(),
  });
  addDust(game, { x, y, count: 6 });
  game.io.sfx('dig', false, { x });
}

function crawl(game, mound) {
  const gap = game.player.x - mound.x;

  if (Math.abs(gap) <= BURROW.speed || mound.time >= BURROW.track) {
    mound.haltAt = mound.time;
    return;
  }

  mound.direction = Math.sign(gap);
  mound.x = onScreen(game, mound.x + mound.direction * BURROW.speed, MARGIN);
  mound.y = groundAt(game.terrain, mound.x);
  if (mound.time % 8 === 0) {
    addDust(game, { x: mound.x - mound.direction * 6, y: mound.y, count: 1 });
  }
}

// a stop only shakes the mound and sprays sand, so a hero who sees it has time to step away;
// a mound the screen scrolls past is carried along at its edge, so its raider is never lost
function rumble(game, mound) {
  const since = mound.time - mound.haltAt;

  mound.x = onScreen(game, mound.x, MARGIN);
  mound.y = groundAt(game.terrain, mound.x);
  if (since % 11 === 0) {
    addDust(game, { x: mound.x, y: mound.y, count: 3 });
    shake(game, 1, 6);
  }

  if (since >= BURROW.rumble) {
    erupt(game, mound);
  }
}

function erupt(game, mound) {
  const { x, y } = mound;
  const raider = spawnRaiderAt(game, mound.raiderKind, { x, y });

  mound.eruptAt = mound.time;
  Object.assign(raider, { airborne: true, state: 'air', vx: 0, vy: BURROW.hopVy });
  addBurst(game, { sprite: 'eruption', x, y, scale: ERUPTION_SCALE, behind: true });
  addDust(game, { x, y, count: 12 });
  shake(game, 3, 12);
  game.io.sfx('eruption', false, { x });
}

export function tunnelMound(game, mound) {
  if (mound.eruptAt) {
    mound.dead = mound.time - mound.eruptAt >= BURROW.eruptTicks;
  } else if (mound.haltAt) {
    rumble(game, mound);
  } else {
    crawl(game, mound);
  }
}

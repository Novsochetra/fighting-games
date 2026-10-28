import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { findPerch } from '../../../src/sim/hazards/drop-perches.js';
import { pendingAmbushes, startAmbush } from '../../../src/sim/stage/ambush.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: every raider of a wave took the perch in sight nearest its spot, so on a road with one
// perch in sight (the Raider Camp's lookout tower, the Bayon's lintel) the whole wave waited on
// the same pixel, drawn as one raider, and dropped onto one spot in a heap. Now raiders on a
// perch stand apart, and with no room left the next waits its turn
const originalRandom = Math.random;
const HERO_X = 180;
const PERCH_ROADS = [
  'raiderCamp',
  'ironWorks',
  'wardenFortress',
  'bayon',
  'pineRidge',
  'emberWoods',
];

function onRoad(theme) {
  const game = createPlayingGame({ io: { sfx: () => {} } });

  game.missionIndex = MISSIONS.findIndex((mission) => mission.theme === theme);
  game.arena = { left: 0, right: 384 * 20 };
  game.player.invincible = 99999;

  return game;
}

// the camera's first stop along the road with a perch in sight of the hero
function inSightOfPerch(theme) {
  const game = onRoad(theme);

  for (let cameraX = 0; cameraX < 384 * 12; cameraX += 16) {
    Object.assign(game.camera, { x: cameraX });
    game.player.x = cameraX + HERO_X;
    if (findPerch(game, game.player.x)) {
      return game;
    }
  }

  throw new Error(`no perch in sight on ${theme}`);
}

const onPerches = (game) =>
  game.projectiles.filter((shot) => shot.kind === 'dropMark' && shot.perch && !shot.raider);
const upThere = (game) => onPerches(game).filter((mark) => !(mark.delay > 0));

function closest(marks) {
  let near = Infinity;

  marks.forEach((mark, i) =>
    marks.slice(i + 1).forEach((other) => {
      near = Math.min(near, Math.abs(mark.x - other.x));
    }),
  );

  return near;
}

describe('a wave of raiders waiting on the perches in sight', () => {
  beforeEach(() => {
    Math.random = seededRandom(3);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('never stands two on one place: each has room, or waits its turn and still drops', () => {
    for (const theme of PERCH_ROADS) {
      const game = inSightOfPerch(theme);
      const wave = [0, 1, 2, 3];
      let dropped = 0;

      wave.forEach((slot) => startAmbush(game, { kind: 'grunt', ambush: 'drop', slot }));
      const perched = onPerches(game).length;

      for (let tick = 0; tick < 600 && pendingAmbushes(game); tick++) {
        expect(closest(upThere(game)), `${theme} at ${tick}`).toBeGreaterThan(DROP.room - 1e-6);
        runTicks(game, 1);
        dropped = Math.max(dropped, game.fighters.filter((one) => one.side === 'enemy').length);
      }

      expect(pendingAmbushes(game), theme).toBe(0);
      expect(dropped, theme).toBe(wave.length);
      expect(perched, theme).toBeGreaterThan(0);
    }
  });
});

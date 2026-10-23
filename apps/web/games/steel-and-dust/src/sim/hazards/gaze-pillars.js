import { FX_COLORS } from '../../art/fx-colors.js';
import { bodyPoint } from '../fighters/body-point.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';

const PILLAR_DAMAGE = 10;
// the middle of his front eye as the gaze strip draws it flaring (frames 3-4), in his own units
// (body-point.js); the ray leaves it
export const GAZE_EYES = { ahead: 8.75, up: 37.25 };
// the pillar strip burns from frame 2 to frame 5 (4 ticks a frame)
export const PILLAR_BURNS = [8, 24];

// the gaze locks on the ground under the hero, and glaring, either side of it too: a mark glows
// on each spot and a pillar of gold bursts up from it as the eyes flare
export function markPillars(game, boss, move) {
  const { lockAt, spots } = move.gaze;
  const eyes = bodyPoint(boss, GAZE_EYES);
  for (const offset of spots) {
    const x = game.player.x + offset * boss.facing;
    game.projectiles.push({
      kind: 'gazePillar',
      x,
      y: groundAt(game.terrain, x),
      eyes,
      direction: boss.facing,
      speed: 0,
      side: boss.side,
      time: -(move.startup - lockAt),
      wait: move.startup - lockAt,
      damage: PILLAR_DAMAGE,
      hitTargets: new Set(),
    });
  }
  game.io.sfx('stoneGaze', false, { x: boss.x });
}

// it bursts up with a roar of light and throws gold sparks up its length while it stands
export function burnPillar(game, pillar) {
  if (pillar.time === 0) {
    shake(game, 3, 10);
    game.io.sfx('goldPillar', false, { x: pillar.x });
  }
  if (pillar.time > 0 && pillar.time < PILLAR_BURNS[1] && pillar.time % 4 === 0) {
    const y = pillar.y - 20 - (pillar.time % 3) * 18;
    addSparks(game, { x: pillar.x, y, count: 3, color: FX_COLORS.gazeGold, speed: 1.8 });
  }
}

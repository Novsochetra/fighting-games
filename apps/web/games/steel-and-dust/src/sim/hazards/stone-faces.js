import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';

const BEAM_DAMAGE = 16;
// a face rises (its strip's frames 0-3), glares, breathes gold for a beat one jump clears (a jump
// keeps a hero's feet over the beam for about 30 ticks), cracks and crumbles into the road
export const FACE_TIMES = { glare: 30, fire: 44, sink: 68, crumble: 76, gone: 96 };
// a face stands this far in from the screen's edge, its rubble sunk this deep into the road so
// its open mouth breathes at a hero's waist; the mouth as the strip draws it, in world pixels
export const FACE_EDGE = 26;
export const FACE_SINK = 36;
export const FACE_MOUTH = { ahead: 15, up: 50 };
const BEAM_HALF = 5;
// a beam reaches this share of the arena, so the far side of it is clear to stand in
const BEAM_REACH = 0.6;

// a giant stone face rises out of the road at one edge of the screen, looking across it
export function raiseFace(game, boss, side) {
  const { left, right } = screenEdges(game);
  const x = side < 0 ? left + FACE_EDGE : right - FACE_EDGE;
  const floor = groundAt(game.terrain, x);
  game.projectiles.push({
    kind: 'stoneFace',
    x,
    y: floor + FACE_SINK,
    floor,
    direction: -side,
    speed: 0,
    side: boss.side,
    time: 0,
    reach: (right - left) * BEAM_REACH,
    damage: BEAM_DAMAGE,
    hitTargets: new Set(),
  });
  addDust(game, { x, y: floor, count: 10, color: FX_COLORS.rootDust });
  shake(game, 3, 30);
  game.io.sfx('faceRise', false, { x });
}

export const mouthOf = (face) => ({
  x: face.x + face.direction * FACE_MOUTH.ahead,
  y: face.y - FACE_MOUTH.up,
});

export const isBreathing = (face) => face.time >= FACE_TIMES.fire && face.time < FACE_TIMES.sink;

// the beam shoots out of the mouth to its full reach over its first few ticks
const BEAM_GROW = 5;
export const beamLength = (face) =>
  face.reach * Math.min(1, (face.time - FACE_TIMES.fire + 1) / BEAM_GROW);

export function beamArea(face) {
  const mouth = mouthOf(face);
  const length = beamLength(face);
  const left = face.direction > 0 ? mouth.x : mouth.x - length;
  return { x: left, y: mouth.y - BEAM_HALF, width: length, height: BEAM_HALF * 2 };
}

// the beam throws gold sparks along its length while it burns
function sparkAlong(game, face) {
  const mouth = mouthOf(face);
  const x = mouth.x + face.direction * randomBetween(10, beamLength(face));
  addSparks(game, { x, y: mouth.y, count: 2, color: FX_COLORS.gazeGold, speed: 1.6 });
}

export function glareFace(game, face) {
  if (face.time === FACE_TIMES.fire) {
    shake(game, 4, FACE_TIMES.sink - FACE_TIMES.fire);
    game.io.sfx('faceBeam', false, { x: face.x });
  }
  if (isBreathing(face) && face.time % 2 === 0) {
    sparkAlong(game, face);
  }
  if (face.time === FACE_TIMES.crumble) {
    addBurst(game, { sprite: 'rockBurst', x: face.x, y: face.floor, scale: 1 });
    game.io.sfx('break', false, { x: face.x });
  }
  face.dead = face.time >= FACE_TIMES.gone;
}

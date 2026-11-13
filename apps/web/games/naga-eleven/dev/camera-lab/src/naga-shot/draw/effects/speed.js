import { hash } from '../../../../../../src/render/duel/hash.js';
import { band } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { VIEW } from '../../world.js';
import { rampLine } from './kit.js';

const RAMP = [SHOT_ART.emerald[2], SHOT_ART.emerald[3], SHOT_ART.emerald[4], SHOT_ART.white];

const PALE_RAMP = [SHOT_ART.grass[2], SHOT_ART.grass[3], SHOT_ART.mesh, SHOT_ART.white];

function lineAt(i, { camera, tick, salt }) {
  const halfWidth = VIEW.width / 2 / camera.unit;
  const halfHeight = VIEW.height / 2 / camera.unit;
  const span = halfWidth * 2.6;
  const speed = 10 + hash(i, 132, salt) * 9;
  const run = (((hash(i, 133, salt) * span + tick * speed) % span) + span) % span;

  return {
    along: run - span / 2,
    lane: (hash(i, 131, salt) - 0.5) * 1.8 * halfHeight,
    length: 20 + hash(i, 134, salt) * 44,
  };
}

export function drawSpeedLines(pen, { camera, tick, heading, count = 7, clear = null, salt = 0 }) {
  const [cos, sin] = [Math.cos(heading), Math.sin(heading)];

  for (let i = 0; i < count; i += 1) {
    const line = lineAt(i, { camera, tick, salt });
    const x = camera.x + cos * line.along - sin * line.lane;
    const y = camera.y + sin * line.along + cos * line.lane;
    const offLane = clear ? Math.abs((clear.x - x) * -sin + (clear.y - y) * cos) : 99;

    if (offLane > 9) {
      const tail = { x: x - cos * line.length, y: y - sin * line.length };

      if (i % 4 === 0) {
        band(pen, { from: { x, y }, to: tail, width: 2, color: SHOT_ART.emerald[2] });
      }

      rampLine(pen, { head: { x, y }, tail, ramp: i % 3 === 1 ? PALE_RAMP : RAMP });
    }
  }
}

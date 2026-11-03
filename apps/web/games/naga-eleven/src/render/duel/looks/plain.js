import { trailPoint } from '../scene.js';
import { band, ring } from '../shapes.js';
import { withFade } from './fade.js';

// a plain strike: a hot streak behind the ball, white at the core, rings of air peeling off it
function streak(pen, scene) {
  const [, , mid, light, core] = scene.art.body;

  for (let i = 6; i >= 1; i -= 1) {
    const from = trailPoint(scene, i * 0.05);
    const to = trailPoint(scene, (i - 1) * 0.05);
    const width = 8 - i;

    band(pen, { from, to, width: width + 3, color: i > 3 ? mid : light });
    band(pen, { from, to, width, color: core });
  }

  for (let i = 1; i <= 3; i += 1) {
    const at = trailPoint(scene, i * 0.14 + ((scene.tick % 6) / 6) * 0.04);

    ring(pen, { ...at, radius: 4 + i * 2, width: 1, color: light });
  }
}

export const PLAIN = { back: (pen, scene) => withFade(pen, scene, () => streak(pen, scene)) };

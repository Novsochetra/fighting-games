import { EFFECT_COLOURS } from '../../art/actors.js';
import { project } from '../camera.js';
import { drawPixelEllipse } from '../actors/shadow.js';
import { ageOf } from './effect-list.js';
import { noise } from './noise.js';

const PUFFS = 3;

export function drawDust(context, camera, effect, { tick }) {
  const age = ageOf(effect, tick);
  const share = age / effect.life;
  const ground = project(camera, effect.x, effect.y);

  for (let i = 0; i < PUFFS; i += 1) {
    const spread = (noise(effect.seed, i) - 0.5) * 14;
    const rise = share * (4 + noise(effect.seed, i + 7) * 5);
    const radius = (1.5 + share * 3.5) * (0.7 + noise(effect.seed, i + 3) * 0.5);

    context.globalAlpha = (1 - share) * 0.75;
    context.fillStyle = EFFECT_COLOURS.dust[Math.min(2, Math.floor((1 - share) * 3))];
    drawPixelEllipse(context, {
      x: ground.x + spread * ground.scale + (effect.drift ?? 0) * share * 8,
      y: ground.y - rise,
      radiusX: radius * ground.scale,
      radiusY: radius * ground.scale * 0.8,
    });
  }

  context.globalAlpha = 1;
}

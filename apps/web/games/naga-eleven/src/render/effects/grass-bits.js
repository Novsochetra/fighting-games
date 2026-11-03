import { EFFECT_COLOURS } from '../../art/actors.js';
import { project } from '../camera.js';
import { ageOf } from './effect-list.js';
import { noise } from './noise.js';

const BITS = 7;
const GRAVITY = 0.16;

export function drawGrassBits(context, camera, effect, tick) {
  const age = ageOf(effect, tick);
  const fade = Math.min(1, (effect.life - age) / 8);

  context.globalAlpha = fade;

  for (let i = 0; i < BITS; i += 1) {
    const speed = 0.6 + noise(effect.seed, i) * 1.4;
    const across = (noise(effect.seed, i + 11) - 0.5) * 2;
    const lift = 1.2 + noise(effect.seed, i + 23) * 1.6;
    const height = Math.max(0, lift * age - (GRAVITY * age * age) / 2);
    const point = project(
      camera,
      effect.x - effect.direction * speed * age * 0.7,
      effect.y + across * speed * age * 0.6,
      height,
    );

    context.fillStyle = EFFECT_COLOURS.grass[i % 3];
    context.fillRect(Math.round(point.x), Math.round(point.y), i % 2 === 0 ? 2 : 1, 1);
  }

  context.globalAlpha = 1;
}

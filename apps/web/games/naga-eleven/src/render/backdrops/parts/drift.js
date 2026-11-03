import { hash } from '../hash.js';
import { artDot, artRect } from '../pen.js';

export { drawMist } from './mist.js';

// fireflies over the paddies: each wanders on its own slow loop and blinks; `colors` [bright,
// glow, dim]
export function drawFireflies(context, { area, count, colors, tick }) {
  for (let i = 0; i < count; i += 1) {
    const phase = tick / (90 + hash(i, 1) * 80) + hash(i, 2) * 6;
    const x = area.x + hash(i, 3) * area.width + Math.sin(phase) * 6;
    const y = area.y + hash(i, 4) * area.height + Math.cos(phase * 1.3) * 3;
    const blink = (tick + Math.floor(hash(i, 5) * 120)) % 120;

    if (blink < 50) {
      artDot(context, { x, y }, colors[blink < 30 ? 0 : 2]);

      if (blink < 20) {
        [-1, 1].forEach((side) => artDot(context, { x: x + side, y }, colors[1]));
      }
    }
  }
}

// lights that breathe: each point picks one of `colors` from a hash of its slot in time
export function drawTwinkles(context, { points, colors, tick, period = 24 }) {
  points.forEach((point, i) => {
    const slot = Math.floor((tick + i * 7) / period);

    artRect(context, point, colors[Math.floor(hash(i, slot) * colors.length)]);
  });
}

// motes of dust turning slowly in a shaft of light, each fading in and out on its own beat
export function drawMotes(context, { area, count, colors, tick }) {
  for (let i = 0; i < count; i += 1) {
    const x = area.x + ((hash(i, 1) * area.width + tick * (0.04 + hash(i, 2) * 0.08)) % area.width);
    const rise = (hash(i, 3) * area.height - tick * 0.03 * (1 + hash(i, 4))) % area.height;
    const y = area.y + ((rise + area.height) % area.height);

    if ((tick + i * 13) % 90 < 60) {
      artDot(context, { x, y }, colors[i % colors.length]);
    }
  }
}

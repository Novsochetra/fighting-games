import { WING_FRAMES } from '../maps.js';
import { noise } from '../noise.js';
import { paletteOf } from '../move-plan.js';
import { paintMap } from '../pixel-map.js';
import { drawStreak } from './streak.js';

// up, level, down, level: a beat every 12 ticks
const BEAT = [0, 1, 2, 1];

// Garuda's wings beating off the ball over a trail of fire, a few feathers shed behind
export function drawWings(context, trail) {
  const { head, flip, art, tick } = trail;
  const beat = Math.floor(tick / 3) % BEAT.length;
  const root = { x: head.x + (flip ? 3 : -3), y: head.y };

  drawStreak(context, trail);
  context.globalAlpha = trail.alpha;
  paintMap(context, WING_FRAMES[BEAT[(beat + 2) % BEAT.length]], {
    ...root,
    palette: paletteOf(art, { deep: true }),
    flip,
    flipY: true,
    bake: trail.bake,
  });
  paintMap(context, WING_FRAMES[BEAT[beat]], {
    ...root,
    palette: paletteOf(art),
    flip,
    bake: trail.bake,
  });
  drawShedFeathers(context, trail);
  context.globalAlpha = 1;
}

function drawShedFeathers(context, trail) {
  const { samples, art, tick } = trail;

  for (let i = 0; i < 4 && samples.length > 0; i += 1) {
    const sample = samples[Math.floor(noise(i, 3) * samples.length * 0.8)];
    const sway = Math.round(Math.sin((tick + i * 9) / 5) * 2);
    const drop = ((tick + i * 11) % 24) * 0.5;

    context.fillStyle = i % 2 ? art.body[3] : art.accent[2];
    context.fillRect(Math.round(sample.x + sway), Math.round(sample.y + drop), 3, 1);
    context.fillStyle = art.body[4];
    context.fillRect(Math.round(sample.x + sway + 2), Math.round(sample.y + drop - 1), 1, 1);
  }
}

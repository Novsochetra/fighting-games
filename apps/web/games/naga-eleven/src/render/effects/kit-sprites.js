import { kitFrame, KIT_FRAMES } from './kit-frames.js';
import { paletteOf } from './move-plan.js';
import { paintMap } from './pixel-map.js';

// a looping effect steps a frame this often, in ticks: six frames come round about twice a second
const LOOP_TICKS = 5;

const loopFrame = (tick) => Math.floor(tick / LOOP_TICKS) % KIT_FRAMES;

// an aura round a player, its frames looping, standing on his feet
export const kitAura =
  (effect) =>
  (context, { foot, art, tick, strength, bake }) => {
    context.globalAlpha = strength;
    paintMap(context, kitFrame(effect, loopFrame(tick)), {
      x: foot.x,
      y: foot.y,
      palette: paletteOf(art),
      bake,
    });
    context.globalAlpha = 1;
  };

// an impact plays its frames once over its life, in the air where it struck or on the grass
export const kitImpact =
  (effect, { onGround = false } = {}) =>
  (context, { at, ground, art, share, bake }) => {
    const index = Math.min(KIT_FRAMES - 1, Math.floor(share * KIT_FRAMES));
    const place = onGround ? ground : at;
    const palette = paletteOf(art);

    paintMap(context, kitFrame(effect, index), { x: place.x, y: place.y, palette, bake });
  };

// a trail's own line along the flight, the kit's head riding the ball the way it flies
export const kitTrail = (effect, drawLine) => (context, trail) => {
  drawLine?.(context, trail);
  context.globalAlpha = trail.alpha;
  paintMap(context, kitFrame(effect, loopFrame(trail.tick)), {
    x: trail.head.x,
    y: trail.head.y,
    palette: paletteOf(trail.art),
    flip: trail.flip,
    bake: trail.bake,
  });
  context.globalAlpha = 1;
};

import { pickColor } from '../dither.js';
import { plot } from '../raster.js';

// how bright a point is under a lamp: 1 at the flame, 0 at `radius` and beyond, `squash`
// stretching the pool sideways
export function litAt({ x, y }, { x: lampX, y: lampY, radius, squash = 1 }) {
  const across = (x - lampX) / radius;
  const down = ((y - lampY) / radius) * squash;

  return Math.max(0, 1 - Math.sqrt(across * across + down * down));
}

// a surface lit by a lamp: each pixel takes the `ramp` step its light gives (dark first), moved
// by `texture(x, y)` steps for weave, planks or grain
export function paintLit(raster, { rect, ramp, light, texture, floor = 0 }) {
  const top = ramp.length - 1;

  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      const along = Math.max(floor, litAt({ x, y }, light) * top) + (texture ? texture(x, y) : 0);

      plot(raster, x, y, pickColor(ramp, { at: along, x, y, edge: 0.5 }));
    }
  }
}

// a shape given by `inside(x, y)`, filled with `colors[0]` and rimmed with `colors[1]` on the
// edges that face `toward` ({ x, y } a step toward the light, or a list of such steps)
export function paintRimmed(raster, { box, inside, colors, toward }) {
  const steps = [toward ?? []].flat();

  for (let y = box.y; y < box.y + box.height; y += 1) {
    for (let x = box.x; x < box.x + box.width; x += 1) {
      if (inside(x, y)) {
        const rim = steps.some((step) => !inside(x + step.x, y + step.y));

        plot(raster, x, y, colors[rim ? 1 : 0]);
      }
    }
  }
}

import { createPixelCanvas } from '../../../support/pixel-canvas.js';

// a 768 by 432 canvas whose context notes every number drawn or set that is not finite
export function strictContext() {
  const canvas = createPixelCanvas(768, 432);
  const inner = canvas.getContext('2d');
  const bad = [];
  const check = (name, values) => {
    if (values.some((value) => typeof value === 'number' && !Number.isFinite(value))) {
      bad.push(name);
    }
  };
  const context = new Proxy(inner, {
    get: (target, name) =>
      typeof target[name] === 'function'
        ? (...args) => {
            check(name, args);

            return target[name](...args);
          }
        : target[name],
    set: (target, name, value) => {
      check(name, [value]);
      target[name] = value;

      return true;
    },
  });

  return { canvas, context, bad };
}

export const painted = (canvas) => canvas.data.some((value, i) => i % 4 === 3 && value > 0);

// how many pixels in a box of the canvas differ from the colour at its corner
export function busyIn(canvas, { x, y, width, height }) {
  const at = (px, py) =>
    canvas.data.subarray((py * canvas.width + px) * 4, (py * canvas.width + px) * 4 + 3).join();
  const corner = at(x, y);
  let busy = 0;

  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      busy += at(px, py) === corner ? 0 : 1;
    }
  }

  return busy;
}

import { SHOT_ART } from '../../colors.js';
import { baked, rgbOf } from '../bake.js';

const { emerald, gold } = SHOT_ART;

export const RIM_LEVELS = 4;

const EDGE_BY_LEVEL = [null, emerald[2], emerald[3], emerald[4], emerald[4]].map(
  (colour) => colour && rgbOf(colour),
);

const INNER = rgbOf(emerald[3]);

const FULL = rgbOf(gold[3]);

const alphaAt = (data, { width, height }, x, y) =>
  x < 0 || y < 0 || x >= width || y >= height ? 0 : data[(y * width + x) * 4 + 3];

function facingOf(data, size, { x, y, light }) {
  const across = light.dx !== 0 && alphaAt(data, size, x + light.dx, y) === 0;
  const down = light.dy !== 0 && alphaAt(data, size, x, y + light.dy) === 0;

  return Number(across) + Number(down);
}

function paintRim(image, { light, level }) {
  const { data, width, height } = image;
  const source = data.slice();
  const size = { width, height };
  const put = (x, y, rgb) => data.set(rgb, (y * width + x) * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const facing = alphaAt(source, size, x, y) ? facingOf(source, size, { x, y, light }) : 0;
      const inward = { x: x - light.dx, y: y - light.dy };

      if (facing > 0) {
        put(x, y, facing === 2 && level >= RIM_LEVELS ? FULL : EDGE_BY_LEVEL[level]);
      }

      if (facing > 0 && level >= 3 && alphaAt(source, size, inward.x, inward.y)) {
        put(inward.x, inward.y, INNER);
      }
    }
  }
}

// turned the way it is drawn first, so the light's side is the screen's
export function rimmedFrame(frame, { light, level, key }) {
  const { sheet, source, mirror } = frame;

  return baked(`rim:${key}:${light.dx},${light.dy}:${level}`, {
    width: source.width,
    height: source.height,
    paint: ({ context }) => {
      context.save();
      context.translate(mirror ? source.width : 0, 0);
      context.scale(mirror ? -1 : 1, 1);
      context.drawImage(
        sheet,
        source.x,
        source.y,
        source.width,
        source.height,
        0,
        0,
        source.width,
        source.height,
      );
      context.restore();

      const image = context.getImageData(0, 0, source.width, source.height);

      paintRim(image, { light, level });
      context.putImageData(image, 0, 0);
    },
  });
}

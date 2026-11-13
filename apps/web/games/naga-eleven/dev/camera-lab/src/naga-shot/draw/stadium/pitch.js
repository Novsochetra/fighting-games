import { worldPen } from '../../camera/world-pen.js';
import { GROUND, VIEW } from '../../world.js';
import { shadeShadows } from '../actors/shadows.js';
import { baked, rgbOf } from '../bake.js';
import { groundOf } from './layers.js';
import { POOL_RAMP, POOL_SPARK, TURF_TONES, turfColour } from './palette.js';
import { lightPool, POOL_TONE } from './pool.js';
import { fillRow, rowOf } from './turf.js';

// worked out a pixel at a time and laid down in one stretch: a rect a pixel would cost far more
const MOST = { width: 400, height: 240 };

let raster = null;

function rasterOf() {
  const canvas = baked('stadium-pitch', { ...MOST, paint: () => {} });

  if (canvas && raster?.canvas !== canvas) {
    const context = canvas.getContext('2d');
    const image = context.createImageData(MOST.width, MOST.height);

    raster = { canvas, context, image, pixels: new Uint32Array(image.data.buffer) };
    raster.tones = new Uint8Array(MOST.width * MOST.height);
  }

  return canvas ? raster : null;
}

const packed = (colour) => {
  const [red, green, blue] = rgbOf(colour);

  return (255 << 24) | (blue << 16) | (green << 8) | red;
};

function paletteOf(dusk) {
  const turf = Array.from({ length: POOL_TONE }, (_, tone) => packed(turfColour(tone, dusk)));

  return [...turf, ...POOL_RAMP.map(packed), ...POOL_SPARK.map(packed)];
}

function viewOf(pen, ground) {
  const { unit, origin } = pen;
  const from = Math.floor(-origin.x / unit) - 1;
  const top = Math.floor(ground.far) - 1;
  const width = Math.min(MOST.width, Math.ceil((VIEW.width - origin.x) / unit) + 1 - from);
  const height = Math.min(MOST.height, Math.ceil((VIEW.height - origin.y) / unit) + 1 - top);

  return { from, top, width, height: Math.max(1, height), stride: MOST.width };
}

function paintTones(tones, { ground, view }) {
  for (let y = 0; y < view.height; y += 1) {
    const info = rowOf(ground, view.top + y);

    fillRow(tones, { info, ground, from: view.from, offset: y * view.stride, width: view.width });
  }
}

function toPixels({ tones, pixels }, { view, dusk }) {
  const palette = paletteOf(dusk);

  for (let y = 0; y < view.height; y += 1) {
    for (let i = y * view.stride, end = i + view.width; i < end; i += 1) {
      pixels[i] = palette[tones[i]];
    }
  }
}

function layDown(pen, { canvas, context: rasterContext, image }, view) {
  const { context, unit, origin } = pen;

  rasterContext.putImageData(image, 0, 0, 0, 0, view.width, view.height);
  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    canvas,
    0,
    0,
    view.width,
    view.height,
    origin.x + view.from * unit,
    origin.y + view.top * unit,
    view.width * unit,
    view.height * unit,
  );
  context.restore();
}

function drawPlainPitch(pen, ground) {
  pen.rect([-40, ground.far - 1, 900, 400], turfColour(TURF_TONES.mid, 0));
  pen.rect([-40, GROUND, 900, 1], turfColour(TURF_TONES.light, 0));
}

export function drawPitch(context, { moment, dusk, pool }) {
  const pen = worldPen(context, moment.camera);
  const ground = groundOf(moment.camera);
  const kept = rasterOf();

  if (!kept) {
    drawPlainPitch(pen, ground);

    return;
  }

  const view = viewOf(pen, ground);

  paintTones(kept.tones, { ground, view });
  shadeShadows(kept.tones, { view, moment });
  lightPool(kept.tones, { view, pool, dusk, frame: moment.clock.frame });
  toPixels(kept, { view, dusk });
  layDown(pen, kept, view);
}

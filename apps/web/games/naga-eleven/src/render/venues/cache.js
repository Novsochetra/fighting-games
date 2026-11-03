import { bakeBillboard } from './layers/billboard.js';
import { billboardFrame, groundFrame } from './layers/frame.js';
import { bakeGround } from './layers/ground.js';
import { paintGroundRow } from './ground/paint.js';
import { rasterToCanvas } from './kit/canvas.js';
import { createRaster, mirror } from './kit/raster.js';
import { keyOf, layoutOf } from './layout.js';

// a venue is drawn once for a pitch and kept; a campaign moves on from venue to venue, so only the
// last few are held, which keeps a phone's memory to what is being played
const KEEP = 2;
const caches = new WeakMap();

function bakeLayer(spec, { lens, bounds, createCanvas }) {
  const frame = billboardFrame(lens, bounds, spec);
  const canvases = Array.from({ length: spec.frames ?? 1 }, (_, index) =>
    rasterToCanvas(
      bakeBillboard(frame, (raster) => spec.paint(raster, frame, index)),
      createCanvas,
    ),
  );

  return { ...spec, frame, canvases };
}

function bakeGroundLayer(spec, { lens, bounds, createCanvas }) {
  const frame = groundFrame(lens, bounds, spec);
  const raster = bakeGround(lens, frame, (pixels, row) =>
    paintGroundRow(pixels, row, { frame, surface: spec.surface, lines: spec.lines }),
  );

  return { frame, canvas: rasterToCanvas(raster, createCanvas) };
}

// small drawings the venue moves about each frame (a dog), each frame of them a canvas of its own,
// then the same again mirrored, facing the other way
function bakeSprite(spec, { createCanvas }) {
  const frames = Array.from({ length: spec.frames }, (_, index) => {
    const raster = createRaster(spec.width, spec.height);

    spec.paint(raster, index);

    return raster;
  });
  const mirrored = frames.map((raster) => mirror(raster));

  return {
    ...spec,
    canvases: [...frames, ...mirrored].map((raster) => rasterToCanvas(raster, createCanvas)),
  };
}

function bakeVenue(venue, layout, tools) {
  const parts = venue.build(layout, tools);

  return {
    layout,
    parts,
    ground: bakeGroundLayer(parts.ground, tools),
    back: (parts.back ?? []).map((spec) => bakeLayer(spec, tools)),
    far: (parts.far ?? []).map((spec) => bakeLayer(spec, tools)),
    near: (parts.near ?? []).map((spec) => bakeLayer(spec, tools)),
    sprites: Object.fromEntries(
      Object.entries(parts.sprites ?? {}).map(([name, spec]) => [name, bakeSprite(spec, tools)]),
    ),
  };
}

function cacheFor(createCanvas) {
  if (!caches.has(createCanvas)) {
    caches.set(createCanvas, new Map());
  }

  return caches.get(createCanvas);
}

export function venueLayers(venue, camera, match, createCanvas) {
  const layout = layoutOf(match);
  const key = `${venue.id}:${keyOf(layout)}`;
  const cache = cacheFor(createCanvas);

  if (!cache.has(key)) {
    while (cache.size >= KEEP) {
      cache.delete(cache.keys().next().value);
    }

    cache.set(
      key,
      bakeVenue(venue, layout, { lens: camera.lens, bounds: camera.bounds, createCanvas }),
    );
  }

  return cache.get(key);
}

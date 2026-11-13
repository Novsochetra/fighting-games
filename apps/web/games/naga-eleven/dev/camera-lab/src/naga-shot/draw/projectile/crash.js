import { hash } from '../../../../../../src/render/duel/hash.js';
import { rasterPen } from '../../../../../../src/render/save-cam/trails/sheet.js';
import { createRaster } from '../../../../../../src/render/venues/kit/raster.js';
import { serpentAt } from '../../tracks/serpent.js';
import { CONTACTS } from '../../world.js';
import { framesOf } from './body.js';
import { drawFigure } from './figure.js';

// room for the Naga as it strikes, its head at the contact and its body back up the way it came
const AREA = { width: 300, height: 200, behind: 230, above: 130 };

// it breaks along a jittered grid into shards about this wide, which fly apart whole
const SHARD = 7;

const kept = new Map();

const seeds = new Map();

function seedOf(column, row) {
  const key = column * 4096 + row;

  if (!seeds.has(key)) {
    seeds.set(key, {
      key,
      x: (column + hash(column, row, 51)) * SHARD,
      y: (row + hash(column, row, 52)) * SHARD,
    });
  }

  return seeds.get(key);
}

function shardKey(x, y) {
  const [column, row] = [Math.floor(x / SHARD), Math.floor(y / SHARD)];
  let best = { key: 0, distance: Infinity };

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const seed = seedOf(column + dx, row + dy);
      const distance = (seed.x - x) ** 2 + (seed.y - y) ** 2;

      best = distance < best.distance ? { key: seed.key, distance } : best;
    }
  }

  return best.key;
}

function paintedCrash(ending) {
  const contact = CONTACTS[ending];
  const offset = { x: AREA.behind - contact.x, y: AREA.above - contact.y };
  const sheet = rasterPen(createRaster(AREA.width, AREA.height), offset);
  const serpent = serpentAt(1, ending);

  drawFigure(sheet, { serpent, frames: framesOf(serpent.joints), frame: 0 });

  return { sheet, offset, serpent };
}

function addPixel(crash, { x, y, color, index }) {
  const key = shardKey(x, y);

  if (!crash.byKey.has(key)) {
    crash.byKey.set(key, crash.shards.length);
    crash.shards.push({ x: 0, y: 0, count: 0, index: crash.shards.length });
  }

  const shard = crash.shards[crash.byKey.get(key)];

  shard.x += x;
  shard.y += y;
  shard.count += 1;
  crash.shardAt[index] = shard.index + 1;
  crash.pixels.push({
    index,
    x,
    y,
    color,
    shard: shard.index,
    reach: Math.hypot(x - crash.contact.x, y - crash.contact.y),
  });
}

// a pixel next to another shard's lies on a crack
function crashOf(ending) {
  const { sheet, offset, serpent } = paintedCrash(ending);
  const { raster } = sheet;
  const crash = {
    serpent,
    contact: CONTACTS[ending],
    pixels: [],
    shards: [],
    byKey: new Map(),
    shardAt: new Int32Array(raster.width * raster.height),
  };

  raster.pixels.forEach((color, index) => {
    if (color !== 0) {
      const x = (index % raster.width) - offset.x;
      const y = Math.floor(index / raster.width) - offset.y;

      addPixel(crash, { x, y, color, index });
    }
  });
  crash.shards.forEach((shard) =>
    Object.assign(shard, { x: shard.x / shard.count, y: shard.y / shard.count }),
  );
  markCracks(crash, raster.width);

  return crash;
}

function markCracks(crash, width) {
  const other = (pixel, step) => {
    const shard = crash.shardAt[pixel.index + step];

    return shard !== 0 && shard !== pixel.shard + 1;
  };

  crash.pixels.forEach((pixel) => {
    pixel.crack = other(pixel, 1) || other(pixel, width);
  });
}

export function crashFigure(ending) {
  if (!kept.has(ending)) {
    kept.set(ending, crashOf(ending));
  }

  return kept.get(ending);
}

import { thresholdAt } from './pixels.js';

// along the body, where the tail starts to fray
export const FRAY_FROM = 0.62;

// Each pixel the body covers learns how far down the body it is (`down`, pixels from the neck)
// and across it (`across`, -1 the belly's edge to 1 the back's), so its scales and plates are
// drawn on the body and swim with it.
let layout = null;

function layoutFor(raster) {
  const size = raster.width * raster.height;

  if (!layout || layout.down.length !== size) {
    layout = {
      down: new Float32Array(size),
      across: new Float32Array(size),
      along: new Float32Array(size),
    };
  }

  layout.down.fill(-1);
  layout.box = { left: raster.width, top: raster.height, right: 0, bottom: 0 };

  return layout;
}

export function framesOf(joints) {
  let down = 0;
  const frames = joints.map((at, i) => {
    const from = joints[Math.max(0, i - 1)];
    const to = joints[Math.min(joints.length - 1, i + 1)];
    const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
    const ahead = { x: (to.x - from.x) / length, y: (to.y - from.y) / length };

    return { ...at, ahead, back: { x: ahead.y, y: -ahead.x } };
  });

  for (let i = frames.length - 1; i >= 0; i -= 1) {
    const next = frames[i + 1];

    down += next ? Math.hypot(next.x - frames[i].x, next.y - frames[i].y) : 0;
    frames[i].down = down;
  }

  return frames;
}

const frayLevel = (along) => 1 - Math.max(0, (along - FRAY_FROM) / (1 - FRAY_FROM)) * 0.9;

function coverPixel(cell, { from, to, step, x, y }) {
  const px = x + 0.5 - from.x;
  const py = y + 0.5 - from.y;
  const share = Math.max(0, Math.min(1, (px * step.x + py * step.y) / step.length2));
  const [dx, dy] = [px - step.x * share, py - step.y * share];
  const radius = from.radius + (to.radius - from.radius) * share;
  const along = from.along + (to.along - from.along) * share;
  const distance = Math.hypot(dx, dy);

  if (distance > radius || thresholdAt(x, y) >= frayLevel(along)) {
    return;
  }

  const side = dx * from.back.x + dy * from.back.y >= 0 ? 1 : -1;

  cell.layout.down[cell.index] = from.down + (to.down - from.down) * share;
  cell.layout.across[cell.index] = (side * distance) / Math.max(1, radius);
  cell.layout.along[cell.index] = along;
}

function grow(box, { left, top, right, bottom }) {
  box.left = Math.max(0, Math.min(box.left, left));
  box.top = Math.max(0, Math.min(box.top, top));
  box.right = Math.max(box.right, right);
  box.bottom = Math.max(box.bottom, bottom);
}

// the stretch nearer the head is laid last, so where the body crosses itself its front is on top
function coverStretch(sheet, cells, { from, to }) {
  const { raster, offset } = sheet;
  const step = { x: to.x - from.x, y: to.y - from.y };
  const reach = Math.max(from.radius, to.radius) + 1;
  const [left, right] = [Math.min(from.x, to.x) - reach, Math.max(from.x, to.x) + reach];
  const [top, bottom] = [Math.min(from.y, to.y) - reach, Math.max(from.y, to.y) + reach];

  step.length2 = step.x * step.x + step.y * step.y || 1;
  grow(cells.box, {
    left: Math.floor(left) + offset.x,
    top: Math.floor(top) + offset.y,
    right: Math.min(raster.width, Math.ceil(right) + offset.x + 1),
    bottom: Math.min(raster.height, Math.ceil(bottom) + offset.y + 1),
  });

  for (let y = Math.floor(top); y <= Math.ceil(bottom); y += 1) {
    const row = y + offset.y;

    for (let x = Math.floor(left); x <= Math.ceil(right); x += 1) {
      const column = x + offset.x;
      const inside = row >= 0 && column >= 0 && row < raster.height && column < raster.width;

      if (inside) {
        coverPixel({ layout: cells, index: row * raster.width + column }, { from, to, step, x, y });
      }
    }
  }
}

const placeOf = (cells, { index, raster, offset }) => ({
  x: (index % raster.width) - offset.x,
  y: Math.floor(index / raster.width) - offset.y,
  down: cells.down[index],
  across: cells.across[index],
  along: cells.along[index],
});

export function paintBody(sheet, { frames, paint }) {
  const cells = layoutFor(sheet.raster);
  const { raster, offset } = sheet;
  const { box } = cells;

  frames.slice(1).forEach((to, i) => coverStretch(sheet, cells, { from: frames[i], to }));

  for (let row = box.top; row < box.bottom; row += 1) {
    const start = row * raster.width;

    for (let index = start + box.left; index < start + box.right; index += 1) {
      if (cells.down[index] >= 0) {
        raster.pixels[index] = paint(placeOf(cells, { index, raster, offset }));
      }
    }
  }

  if (box.right > box.left) {
    sheet.cover(box);
  }
}

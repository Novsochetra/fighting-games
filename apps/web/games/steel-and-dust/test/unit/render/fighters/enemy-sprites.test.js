import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../../src/config.js';
import { ENEMY_ATLAS } from '../../../../src/data/enemies/atlas/index.js';
import { ENEMY_SPRITES } from '../../../../src/data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../../../src/data/enemies/enemy-types.js';
import { PIXEL, snap } from '../../../../src/render/fx/fine-pixels.js';
import { drawEnemyFrame, TIE_BREAK } from '../../../../src/render/fighters/enemy-sprites.js';

const sizeOf = (id) => {
  const type = Object.values(ENEMY_TYPES).find((def) => def.sprite === id);
  return type?.boss ? type.scale : 1;
};

// where the whole grid cell was drawn before the sheets were packed, along one axis
function cellSpan(sprite, size, { length, feet }) {
  const scale = size / (RENDER_SCALE * (sprite.density ?? 1));
  const start = snap(-feet * scale);
  return { start, step: (snap((length - feet) * scale) - start) / length };
}

function drawnPiece(id, name, index) {
  const calls = [];
  const context = {
    save() {},
    restore() {},
    translate() {},
    scale() {},
    drawImage: (image, ...args) => calls.push(args),
  };
  const sheets = { images: { [id]: {} }, tints: null };
  const frame = { id, frame: [name, index], x: 0, y: 0, facing: 1, size: sizeOf(id) };
  drawEnemyFrame({ context }, sheets, frame);
  return calls;
}

// every screen pixel centre the piece covers reads the sheet pixel the cell read there, and every
// centre the cell read the piece's paint from is covered
function axisMismatches(cell, { source, sourceLength, from, size, pieceStart, offset, length }) {
  const wrong = [];
  const firstPaint = cell.start + (offset + 1) * cell.step;
  const lastPaint = cell.start + (offset + length - 1) * cell.step;
  for (let pixel = Math.floor(firstPaint / PIXEL); pixel * PIXEL < lastPaint; pixel++) {
    const centre = (pixel + 0.5) * PIXEL;
    const before = (centre - cell.start) / cell.step;
    if (before < offset + 1 || before >= offset + length - 1) {
      continue;
    }
    const after = source + ((centre - from) * sourceLength) / size - pieceStart + offset;
    const covered = centre > from && centre < from + size;
    if (!covered || Math.abs(after - before) > TIE_BREAK + 1e-9) {
      wrong.push(centre);
    }
  }
  return wrong;
}

function pieceMismatches(id, name, index) {
  const sprite = ENEMY_SPRITES[id];
  const piece = ENEMY_ATLAS[id][sprite.strips[name].row]?.[index];
  const [call] = drawnPiece(id, name, index);
  if (!piece) {
    return call ? ['an empty frame drew'] : [];
  }
  const [sx, sy, width, height, left, top] = piece;
  const [srcX, srcY, srcWidth, srcHeight, dx, dy, dWidth, dHeight] = call;
  const edges = [dx, dy, dWidth, dHeight].filter(
    (value) => Math.abs(value / PIXEL - Math.round(value / PIXEL)) > 1e-9,
  );
  const size = sizeOf(id);
  const across = cellSpan(sprite, size, { length: sprite.frameWidth, feet: sprite.feetX });
  const down = cellSpan(sprite, size, { length: sprite.frameHeight, feet: sprite.feetY });
  return [
    ...edges.map((edge) => `edge ${edge} between screen pixels`),
    ...axisMismatches(across, {
      source: srcX,
      sourceLength: srcWidth,
      from: dx,
      size: dWidth,
      pieceStart: sx,
      offset: left,
      length: width,
    }),
    ...axisMismatches(down, {
      source: srcY,
      sourceLength: srcHeight,
      from: dy,
      size: dHeight,
      pieceStart: sy,
      offset: top,
      length: height,
    }),
  ];
}

// the closest a screen pixel centre over the frame comes to a line between two sheet pixels
// without lying on it
function nearestMiss({ start, step }, length) {
  let nearest = Infinity;
  for (let centre = start + PIXEL / 2; centre < start + length * step; centre += PIXEL) {
    const sheet = (centre - start) / step;
    const miss = Math.abs(sheet - Math.round(sheet));
    nearest = miss > 1e-9 ? Math.min(nearest, miss) : nearest;
  }
  return nearest;
}

describe('an enemy drawn from its packed sheet', () => {
  it('lands every piece where its frame put it, on whole screen pixels, reading the same sheet pixels', () => {
    for (const [id, sprite] of Object.entries(ENEMY_SPRITES)) {
      for (const [name, strip] of Object.entries(sprite.strips)) {
        for (let index = 0; index < strip.frames; index++) {
          expect(pieceMismatches(id, name, index), `${id} ${name} ${index}`).toEqual([]);
        }
      }
    }
  });

  it('breaks only exact ties between two sheet pixels, at every enemy scale', () => {
    for (const [id, sprite] of Object.entries(ENEMY_SPRITES)) {
      const size = sizeOf(id);
      const across = cellSpan(sprite, size, { length: sprite.frameWidth, feet: sprite.feetX });
      const down = cellSpan(sprite, size, { length: sprite.frameHeight, feet: sprite.feetY });
      expect(nearestMiss(across, sprite.frameWidth), id).toBeGreaterThan(TIE_BREAK * 2);
      expect(nearestMiss(down, sprite.frameHeight), id).toBeGreaterThan(TIE_BREAK * 2);
    }
  });

  it('draws nothing for a frame its sheet leaves empty', () => {
    expect(ENEMY_ATLAS.gnoll[ENEMY_SPRITES.gnoll.strips.bloodFrenzy.row][8]).toBeNull();
    expect(drawnPiece('gnoll', 'bloodFrenzy', 8)).toEqual([]);
  });
});

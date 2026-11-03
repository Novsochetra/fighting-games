import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SPRITE_KIT } from '../../../../src/art/sprite-kit.js';
import { SPRITES } from '../../../../src/data/sprites.js';
import { createActorArt, loadSprites, looksOf } from '../../../../src/render/actors/index.js';
import { DIRECTIONS, rowFor } from '../../../../src/render/actors/directions.js';
import { sheetOf, standHeightOf } from '../../../../src/render/actors/sheets.js';
import { createCamera, updateCamera } from '../../../../src/render/camera.js';
import { drawFrame } from '../../../../src/render/draw-frame.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { decodePng } from '../../../support/png.js';
import { attackingMatch } from './match-fixture.js';

const GAME = fileURLToPath(new URL('../../../../', import.meta.url));
const loadImage = async (source) => decodePng(readFileSync(`${GAME}${source}`));

const hexAt = (data, at) =>
  `#${[0, 1, 2].map((i) => data[at + i].toString(16).padStart(2, '0')).join('')}`;

function opaqueColours(image) {
  const found = new Set();

  for (let at = 0; at < image.data.length; at += 4) {
    if (image.data[at + 3] > 0) {
      found.add(hexAt(image.data, at));
    }
  }

  return found;
}

function lowestOpaqueRow(image, { left, top, width, height }) {
  for (let y = top + height - 1; y >= top; y -= 1) {
    for (let x = left; x < left + width; x += 1) {
      if (image.data[(y * image.width + x) * 4 + 3] > 0) {
        return y - top;
      }
    }
  }

  return -1;
}

const sprites = await loadSprites(SPRITES, { loadImage });
const art = () => createActorArt({ sprites, createCanvas: createPixelCanvas });

describe('the real sprite sheets', () => {
  it('load whole, each as wide as its frames and as tall as its rows', () => {
    const { width, height } = SPRITES.frame;

    expect(Object.keys(sprites.images).sort()).toEqual(Object.keys(SPRITES.animations).sort());

    for (const [name, animation] of Object.entries(SPRITES.animations)) {
      const rows = DIRECTIONS.map((direction) => rowFor(animation.rows, direction).row);

      expect(sprites.images[name].width).toBe(animation.frames * width);
      expect(sprites.images[name].height).toBeGreaterThanOrEqual((Math.max(...rows) + 1) * height);
    }
  });

  it('stand every idle way with its soles on the anchor line, as tall as the marker floats over', () => {
    const { frame, anchor } = SPRITES;
    const idle = sprites.images.idle;

    for (let row = 0; row < idle.height / frame.height; row += 1) {
      const box = { left: 0, top: row * frame.height, ...frame };

      expect(lowestOpaqueRow(idle, box)).toBe(anchor.y - 1);
    }

    expect(standHeightOf(SPRITES)).toBe(58);
  });

  it('wear a kit wholly: no shirt, shorts or socks shade of the sheets is left after recolouring', () => {
    const match = attackingMatch('11');
    const actors = art();
    const look = looksOf(match).players[match.controlled];
    const parts = ['shirt', 'shorts', 'socks'];

    for (const name of Object.keys(SPRITES.animations)) {
      const colours = opaqueColours(sheetOf(actors, look, name));

      expect(parts.flatMap((part) => SPRITE_KIT[part]).filter((hex) => colours.has(hex))).toEqual(
        [],
      );
      expect(look.shirt.some((shade) => colours.has(shade))).toBe(true);
    }
  });
});

describe.each(['7', '11'])('a %s a side frame from the real sprites', (format) => {
  it('draws both sides in their kits', () => {
    const match = attackingMatch(format);
    const camera = createCamera(match);
    const canvas = createPixelCanvas(768, 432);

    camera.pan = null;

    for (let i = 0; i < 90; i += 1) {
      updateCamera(camera, match);
    }

    drawFrame(canvas.getContext('2d'), match, camera, {
      actors: art(),
      createCanvas: createPixelCanvas,
    });

    const colours = opaqueColours(canvas);
    const kits = looksOf(match).kits.map((kit) => kit.outfield.shirt);

    expect(kits.every((ramp) => ramp.some((shade) => colours.has(shade)))).toBe(true);
  });
});

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { TREE } from '../../../src/data/trees.js';
import { loadFxSheets } from '../../../src/render/fx/fx-sheets.js';
import { createPainter } from '../../../src/render/painter.js';
import { drawTrees } from '../../../src/render/scene/trees.js';
import { FakeImage } from '../../support/fake-image.js';
import { readPngAlpha } from '../../support/png-alpha.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

// Bug: a felled dead pine looked to float over the road. Its trunk tapered on its underside, so
// its tip hung 10 px over the road line, and the stump and trunk stood on the top edge of the
// road's grass, where the hero's feet sink into it. The trunk now lies level on the road and the
// whole tree is drawn a little down into the grass
const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const art = readPngAlpha(join(GAME_ROOT, 'assets/sprites/fx/deadTree.png'));
const { frameWidth, anchorX, anchorY } = FX_SPRITES.deadTree;
const FALLEN = 3;
const RESTING = 3;
const STUMP = { x: 200, y: GROUND_Y, state: 'fallen', time: 0, direction: 1 };

function lowestPainted(column) {
  for (let y = anchorY; y >= 0; y--) {
    if (art.alpha(FALLEN * frameWidth + column, y) > 0) {
      return y;
    }
  }

  return null;
}

function trunkColumns() {
  const columns = [];
  for (let column = anchorX + TREE.from; column < frameWidth; column++) {
    const lowest = lowestPainted(column);

    if (lowest !== null) {
      columns.push({ column, lowest });
    }
  }

  return columns;
}

function treeTop() {
  const sheets = loadFxSheets({
    createImage: () => new FakeImage(),
    createCanvas: () => null,
    baseUrl: '',
  });
  const { context, log } = createRecordingContext(null);

  drawTrees(createPainter(context), sheets, { trees: [STUMP], cameraX: 0 });
  const [x, y] = log
    .find((call) => call.startsWith('translate('))
    .slice(10, -1)
    .split(',');

  return { x: Number(x), y: Number(y) };
}

describe('a felled dead pine', () => {
  it('lies along the road to its tip, not tilted up off it', () => {
    const columns = trunkColumns();

    expect(columns.at(-1).column).toBeGreaterThan(anchorX + TREE.reach - 8);
    for (const { column, lowest } of columns) {
      expect(anchorY - lowest, `column ${column}`).toBeLessThanOrEqual(RESTING);
    }
  });

  it('is drawn a little down into the road’s grass, under its stump', () => {
    const { x, y } = treeTop();

    expect(x).toBe(STUMP.x);
    expect(y).toBeGreaterThan(GROUND_Y);
    expect(y).toBeLessThan(GROUND_Y + 6);
  });
});

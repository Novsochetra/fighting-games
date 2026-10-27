import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { boughRow } from '../../../src/render/scene/nest-trees.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
// the thick end of the nest's branch is this many pixels across and tall where it meets the tree
const BRANCH_END = { across: 4, tall: 5 };

const forests = Object.entries(PAINTED_BACKDROPS).filter(([, backdrop]) => backdrop.nestTree);

const branches = readPngAlpha(join(GAME_ROOT, 'assets/sprites/fx/nestBranch.png'));

// the colours of the pixels painted in one frame of the branch strip
function branchColours(frame) {
  const { frameWidth, frameHeight } = FX_SPRITES.nestBranch;
  const colours = new Set();

  for (let x = frame * frameWidth; x < (frame + 1) * frameWidth; x++) {
    for (let y = 0; y < frameHeight; y++) {
      if (branches.alpha(x, y)) {
        colours.add(branches.colorKey(x, y));
      }
    }
  }

  return colours;
}

function treeColours(backdrop) {
  const { from, to, base } = backdrop.nestTree;
  const png = layerAlpha(backdrop);
  const colours = new Set();

  for (let x = from; x < to; x++) {
    for (let y = 0; y < base; y++) {
      if (png.alpha(x, y)) {
        colours.add(png.colorKey(x, y));
      }
    }
  }

  return colours;
}

function layerAlpha(backdrop) {
  const path = join(
    GAME_ROOT,
    `assets/backdrops/${backdrop.folder}/${backdrop.nestTree.layer}.png`,
  );

  return readPngAlpha(path);
}

describe('the trees the hornet nests hang from', () => {
  it('stand in every forest with a nest over its road', () => {
    const withNests = MISSIONS.filter((mission) => mission.nests.length);
    const themes = new Set(withNests.map((mission) => mission.theme));

    for (const theme of themes) {
      expect(PAINTED_BACKDROPS[theme].nestTree, theme).toBeDefined();
    }
  });

  it('are cut from a layer the forest paints, inside its picture', () => {
    for (const [theme, backdrop] of forests) {
      const { layer, from, to, base, bough } = backdrop.nestTree;
      const png = layerAlpha(backdrop);

      expect(
        backdrop.layers.map(({ name }) => name),
        theme,
      ).toContain(layer);
      expect(from >= 0 && from < bough && bough < to && to <= png.width, theme).toBe(true);
      expect(base > boughRow(backdrop.nestTree) && base <= png.height, theme).toBe(true);
    }
  });

  it('grow the nest’s branch out of the tree itself, not out of the air beside it', () => {
    for (const [theme, backdrop] of forests) {
      const { bough } = backdrop.nestTree;
      const row = boughRow(backdrop.nestTree);
      const png = layerAlpha(backdrop);

      for (let x = bough - BRANCH_END.across; x <= bough; x++) {
        for (let y = row - BRANCH_END.tall; y <= row; y++) {
          expect(png.alpha(x, y), `${theme} at ${x},${y}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('paint the branch the nest hangs by in the tree’s own bark, a frame of its own each', () => {
    const frames = forests.map(([, backdrop]) => backdrop.nestTree.branch);

    expect(new Set(frames).size).toBe(forests.length);
    for (const [theme, backdrop] of forests) {
      const { branch } = backdrop.nestTree;
      const bark = treeColours(backdrop);
      const colours = [...branchColours(branch)];

      expect(branch >= 0 && branch < FX_SPRITES.nestBranch.frames, theme).toBe(true);
      expect(colours.length, theme).toBeGreaterThan(8);
      expect(
        colours.filter((colour) => !bark.has(colour)),
        theme,
      ).toEqual([]);
    }
  });
});

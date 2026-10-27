import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { boughRow } from '../../../src/render/scene/nest-trees.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
// the thick end of the nest's branch is this many pixels across and tall where it meets the tree
const BRANCH_END = { across: 4, tall: 5 };

const forests = Object.entries(PAINTED_BACKDROPS).filter(([, backdrop]) => backdrop.nestTree);

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
});

import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { selectMission } from '../../../src/sim/stage/flow.js';
import { readPngAlpha } from '../../support/png-alpha.js';
import { createTestGame } from '../../support/test-game.js';

// Bug: the near strip of the Angkor Wat road slid its naga balustrade behind the moat's breach as
// the camera moved, the naga and the stone it stands on at the road's own height in the gap, so the
// breach read as a bridge and the water down in it went unseen. The strip is laid so nothing of it
// ever stands behind the breach, and the back plate's own moat shows there over the water
const GAME_ROOT = join(import.meta.dirname, '../../../');
const temple = MISSIONS.find((mission) => mission.theme === 'angkorWat');
const { folder, layers } = PAINTED_BACKDROPS.angkorWat;
const near = layers.find((layer) => layer.name === 'near');
const strip = readPngAlpha(join(GAME_ROOT, `assets/backdrops/${folder}/near.png`));

// the strip's columns that show behind the breach, for every camera that has it on screen, as
// drawLayer lays the strip
function columnsBehind({ from, to }) {
  const columns = new Set();

  for (let cameraX = from - VIEW_WIDTH; cameraX <= to; cameraX++) {
    const offset = cameraX * near.parallax;
    const start = Math.round(-(((offset % strip.width) + strip.width) % strip.width));

    for (let x = Math.max(0, from - cameraX); x < Math.min(VIEW_WIDTH, to - cameraX); x++) {
      columns.add((((x - start) % strip.width) + strip.width) % strip.width);
    }
  }

  return [...columns];
}

describe('the Angkor moat seen through its breach', () => {
  it('has nothing of the near strip behind it, from any camera that shows it', () => {
    const game = createTestGame();

    selectMission(game, temple.index);
    for (const span of game.terrain.water) {
      const standing = columnsBehind(span).filter((x) =>
        Array.from({ length: strip.height }, (_, y) => y).some((y) => strip.alpha(x, y) > 0),
      );

      expect(standing, `moat at ${span.from}`).toEqual([]);
    }
  });
});

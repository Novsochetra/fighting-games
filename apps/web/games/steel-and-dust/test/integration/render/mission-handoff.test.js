import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../src/art/colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../src/config.js';
import { WIPE_CELL } from '../../../src/render/overlays/wipe-timing.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { stageClear } from '../../../src/sim/stage/stage-clear.js';
import { createLateView } from '../../support/late-images.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const CELLS = (VIEW_WIDTH / WIPE_CELL) * (VIEW_HEIGHT / WIPE_CELL);
const MOSAIC = 'drawImage(canvas(192x108,';

// how many of the screen's cells the wipe's night covers whole: one full-size diamond each
function nightCells(view, log) {
  const sprite = view.diamonds.get(`${COLORS.night}:${WIPE_CELL}`);
  const stamp = sprite && `drawImage(${sprite.recordingId()},`;
  return sprite ? log.filter((call) => call.startsWith(stamp)).length : 0;
}

const drawsRoad = (log) => log.some((call) => call.startsWith('drawImage(img(ground.png)'));
const isSorted = (values, order) =>
  values.every((value, i) => i === 0 || order(values[i - 1], value));

// the first road and the sprites come in, then the next road arrives while the first is fought
function fightFirstMission({ nextRoad }) {
  const game = createPlayingGame();
  const { view, images, log } = createLateView();
  renderFrame(game, view);
  images.loadAll();
  renderFrame(game, view);
  if (nextRoad === 'loads') {
    images.loadAll();
  } else {
    images.failAll();
  }
  while (game.fadeIn > 0) {
    renderFrame(game, view);
  }
  return { game, view, log };
}

function walkOn({ game, view, log }) {
  stageClear(game);
  const frames = [];
  while (game.missionIndex === 0 || game.fadeIn > 0) {
    runTicks(game, 1);
    log.length = 0;
    renderFrame(game, view);
    const drawn = log.slice();
    frames.push({
      mission: game.missionIndex,
      night: nightCells(view, drawn),
      mosaic: drawn.some((call) => call.startsWith(MOSAIC)),
      road: drawsRoad(drawn),
      drawn,
    });
  }
  return frames;
}

describe('the walk on to the next mission', () => {
  const frames = walkOn(fightFirstMission({ nextRoad: 'loads' }));
  const cleared = frames.filter((frame) => frame.mission === 0);
  const next = frames.filter((frame) => frame.mission === 1);

  it('wipes night over every cell of the cleared road by the time the next mission starts', () => {
    const wipe = cleared.map((frame) => frame.night).filter((night) => night > 0);
    expect(wipe.length).toBeGreaterThan(10);
    expect(isSorted(wipe, (before, after) => before <= after)).toBe(true);
    expect(cleared.at(-1).night).toBe(CELLS);
  });

  it('opens the next road out of that same night, with no loading screen between', () => {
    const wipe = next.map((frame) => frame.night);
    expect(wipe[0]).toBe(CELLS);
    expect(isSorted(wipe, (before, after) => before >= after)).toBe(true);
    expect(wipe.at(-1)).toBe(0);
    expect(frames.every((frame) => frame.road)).toBe(true);
  });

  it('breaks each road into blocks under the wipe, and leaves the next one whole once open', () => {
    const blocky = (list) => list.filter((frame) => frame.mosaic).length;
    expect(blocky(cleared)).toBeGreaterThan(20);
    expect(blocky(next)).toBeGreaterThan(20);
    expect(next.at(-1).mosaic).toBe(false);
  });

  it('goes on over the plain road when the next road cannot be loaded', () => {
    const failed = walkOn(fightFirstMission({ nextRoad: 'fails' }));
    const first = failed.find((frame) => frame.mission === 1);
    expect(first.road).toBe(false);
    expect(first.drawn.some((call) => call.startsWith('drawImage('))).toBe(true);
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createCameraTransform } from '../../../src/render/camera-transform.js';
import { createView } from '../../../src/render/create-view.js';
import { backdropFor } from '../../../src/render/scene/backdrop.js';
import { trunkAt } from '../../../src/render/scene/canopy-columns.js';
import { drawCanopyRustle, rustlePatch } from '../../../src/render/scene/canopy-rustle.js';
import { drawCrownCover } from '../../../src/render/scene/crown-cover.js';
import { swayBlocks } from '../../../src/render/scene/sway-patch.js';
import { startAmbush } from '../../../src/sim/stage/ambush.js';
import { FakeImage } from '../../support/fake-image.js';
import { createGridContext } from '../../support/grid-canvas.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const ROADS = ['oldGrove', 'bambooPass', 'fireflyHollow', 'pineRidge', 'emberWoods'];
// a wave of three, one after another round the hero, the trees each shakes overlapping; the camera
// comes to rest on the hero first, so only the trees move on the screen
const WAVE = { slots: 3, every: 28, ticks: 200, settle: 90 };

function gridView() {
  const { context, misses, counts } = createGridContext();

  context.canvas = { width: 768, height: 432 };
  const view = createView({
    context,
    createCanvas: (width, height) => Object.assign(new RecordingCanvas(), { width, height }),
    createImage: () => new FakeImage(),
    baseUrl: '',
  });

  context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);

  return { view, misses, counts };
}

// every moved pixel of the trees on the screen, keyed by where it is, with how far it is moved
const pixelAt = (x, y) => x * 1024 + y;
const offsetCode = (dx, dy) => (dx + 16) * 64 + dy + 16;
const STILL = offsetCode(0, 0);

function movedPixels(patch) {
  const moved = new Map();
  const lay = (block, { x, width, dx, dy }) => {
    for (let i = 0; i < width * block.height; i++) {
      moved.set(pixelAt(x + (i % width), block.y + Math.floor(i / width)), offsetCode(dx, dy));
    }
  };

  for (const block of patch ? swayBlocks(patch) : []) {
    block.runs.forEach((run) => lay(block, run));
  }

  return moved;
}

function drawTrees(game, { view, theme }) {
  const cameraX = Math.round(game.camera.x);
  const scene = { game, backdrop: backdropFor(view, theme), cameraX };
  const setLayer = createCameraTransform(view.painter.context, game);

  drawCanopyRustle(view.painter, setLayer, scene);
  drawCrownCover(view.painter, setLayer, scene);

  return { ...scene, patch: rustlePatch(game, scene) };
}

// a wave dropping on a road, played and drawn tick by tick until the last raider has landed
function playWave(theme) {
  const { view, misses, counts } = gridView();
  const game = createPlayingGame();
  const frames = [];

  game.missionIndex = MISSIONS.findIndex((mission) => mission.theme === theme);
  game.arena = { left: 0, right: 384 * 20 };
  Object.assign(game.player, { x: 180, invincible: 99999 });
  runTicks(game, WAVE.settle);
  for (let tick = 0; tick < WAVE.ticks; tick++) {
    const slot = tick / WAVE.every;

    if (Number.isInteger(slot) && slot < WAVE.slots) {
      startAmbush(game, { kind: 'grunt', ambush: 'drop', slot });
    }

    runTicks(game, 1);
    const drawn = drawTrees(game, { view, theme });

    frames.push({ ...drawn, moved: movedPixels(drawn.patch) });
  }

  return { frames, misses, draws: counts.draws };
}

const offsetOf = (frame, key) => frame.moved.get(key) ?? STILL;
const keysOf = (...frames) => new Set(frames.flatMap((frame) => [...frame.moved.keys()]));
const apart = (code, other) =>
  Math.max(Math.abs((code >> 6) - (other >> 6)), Math.abs((code & 63) - (other & 63)));

function biggestStep(frames) {
  let biggest = 0;

  frames.slice(1).forEach((frame, i) => {
    for (const key of keysOf(frame, frames[i])) {
      biggest = Math.max(biggest, apart(offsetOf(frame, key), offsetOf(frames[i], key)));
    }
  });

  return biggest;
}

// a pixel moved somewhere and back again within two ticks: a flicker
function flicks(frames) {
  const found = [];

  for (let tick = 1; tick < frames.length - 2; tick++) {
    for (const key of keysOf(frames[tick], frames[tick - 1])) {
      const before = offsetOf(frames[tick - 1], key);
      const next = [frames[tick + 1], frames[tick + 2]];

      if (
        offsetOf(frames[tick], key) !== before &&
        next.some((on) => offsetOf(on, key) === before)
      ) {
        found.push(`${Math.floor(key / 1024)},${key % 1024} at ${tick}`);
      }
    }
  }

  return found;
}

const plays = {};

describe('the trees over a wave of raiders dropping out of them', () => {
  beforeAll(() => {
    const originalRandom = Math.random;

    Math.random = seededRandom(8);
    ROADS.forEach((theme) => {
      plays[theme] = playWave(theme);
    });
    Math.random = originalRandom;
  }, 60000);

  it('sway on every road with trees, and are still again once the raiders are down', () => {
    for (const theme of ROADS) {
      const { frames } = plays[theme];

      expect(Math.max(...frames.map((frame) => frame.moved.size)), theme).toBeGreaterThan(400);
      expect(frames.at(-1).moved.size, theme).toBe(0);
    }
  });

  it('move every part at most a pixel a tick, and never flick a pixel there and back', () => {
    for (const theme of ROADS) {
      const { frames } = plays[theme];

      expect(biggestStep(frames), theme).toBe(1);
      expect(flicks(frames), theme).toEqual([]);
    }
  });

  it('never move a trunk, nor the edges of the patch, so no seam ever shows', () => {
    for (const theme of ['oldGrove', 'fireflyHollow']) {
      const { canopy } = PAINTED_BACKDROPS[theme];

      for (const { cameraX, patch, moved, backdrop } of plays[theme].frames) {
        const layer = backdrop.layers.find((one) => one.name === canopy.layer);
        const pixels = [...moved.keys()].map((key) => [Math.floor(key / 1024), key % 1024]);
        const onTrunk = pixels.filter(([x]) => trunkAt({ canopy, layer, cameraX }, x) === 1);
        const edges = [patch?.left, patch?.right - 1];
        const onEdge = pixels.filter(([x, y]) => edges.includes(x) || y === patch.bottom - 1);

        expect(onTrunk, theme).toEqual([]);
        expect(onEdge, theme).toEqual([]);
      }
    }
  });

  it('are laid on whole pixels of the screen', () => {
    for (const theme of ROADS) {
      expect(plays[theme].draws, theme).toBeGreaterThan(100);
      expect(plays[theme].misses, theme).toEqual([]);
    }
  });
});

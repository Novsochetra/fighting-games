import { describe, expect, it, vi } from 'vitest';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { loadPaintedBackdrop } from '../../../src/render/scene/painted-backdrop.js';
import { scenePalette } from '../../../src/render/scene/scene-palette.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const THEME = 'oldGrove';
// the far plate stands in for a canopy, so its second showing in a frame is the front layer
const FRONT = 'img(back.png)';

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// both runs draw the same sparks and dust, so their frames can be compared call for call
function renderForest(fronts) {
  const random = vi.spyOn(Math, 'random').mockImplementation(seededRandom(7));
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  if (fronts) {
    view.backdrops[THEME] = loadPaintedBackdrop(view.loaders, {
      ...PAINTED_BACKDROPS[THEME],
      fronts,
    });
  }
  const game = createTestGame();
  selectMission(game, MISSIONS.find((mission) => mission.theme === THEME).index);
  startPlay(game);
  runTicks(game, 30);
  // in play, the wipe that opens a mission over: its mosaic samples the frame drawn before it
  game.fadeIn = 0;
  screen.recording.log.length = 0;
  renderFrame(game, view);
  random.mockRestore();
  return screen.recording.log;
}

const lastIndexOf = (log, part) => log.findLastIndex((call) => call.includes(part));

describe('a painted front layer', () => {
  const plain = renderForest();
  const canopied = renderForest([{ name: 'back', parallax: 1.2 }]);
  const lastGround = lastIndexOf(canopied, 'img(ground.png)');
  const frontDraws = canopied
    .map((call, index) =>
      index > lastGround && call.startsWith(`drawImage(${FRONT}`) ? index : -1,
    )
    .filter((index) => index >= 0);
  const first = frontDraws[0] - 1;
  const last = frontDraws.at(-1);

  it('tiles across the view after the road, the fighters and the air in front of them', () => {
    expect(frontDraws.length).toBeGreaterThanOrEqual(2);
    expect(frontDraws).toEqual(frontDraws.map((_, i) => frontDraws[0] + i));
    expect(lastIndexOf(canopied, 'img(hero_')).toBeLessThan(first);
    expect(lastGround).toBeLessThan(first);
  });

  it('comes on the shaking layer, just before the ferns of the foreground', () => {
    const fern = `fillStyle=${scenePalette(THEME).rubble.fern}`;
    expect(canopied[first]).toMatch(/^setTransform\(/);
    expect(canopied[last + 1]).toBe(canopied[first]);
    expect(canopied.indexOf(fern, last)).toBeGreaterThan(last);
  });

  it('adds only its own calls, so a forest without one draws exactly as before', () => {
    expect([...canopied.slice(0, first), ...canopied.slice(last + 1)]).toEqual(plain);
  });
});

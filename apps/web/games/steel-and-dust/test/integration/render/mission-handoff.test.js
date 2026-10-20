import { describe, expect, it } from 'vitest';
import { COLORS } from '../../../src/art/colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../src/config.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { stageClear } from '../../../src/sim/stage/stage-clear.js';
import { createLateView } from '../../support/late-images.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const FULL_VIEW = `fillRect(0,0,${VIEW_WIDTH},${VIEW_HEIGHT})`;

// how dark the night laid over the whole frame is
function nightOver(log) {
  const index = log.findLastIndex(
    (call, i) => call === FULL_VIEW && log[i - 1] === `fillStyle=${COLORS.night}`,
  );
  const alpha = log[index - 2];
  return index > 1 && alpha.startsWith('globalAlpha=') ? Number(alpha.split('=')[1]) : 0;
}

const drawsRoad = (log) => log.some((call) => call.startsWith('drawImage(img(ground.png)'));

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
      night: nightOver(drawn),
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

  it('fades the cleared road to full night by the time the next mission starts', () => {
    const fade = cleared.map((frame) => frame.night).filter((night) => night > 0);
    expect(fade.length).toBeGreaterThan(30);
    expect(fade).toEqual(fade.toSorted((first, second) => first - second));
    expect(cleared.at(-1).night).toBe(1);
  });

  it('fades the next road in from that same night, with no loading screen between', () => {
    const fade = next.map((frame) => frame.night);
    expect(fade[0]).toBe(1);
    expect(fade).toEqual(fade.toSorted((first, second) => second - first));
    expect(fade.at(-1)).toBeLessThan(0.05);
    expect(frames.every((frame) => frame.road)).toBe(true);
  });

  it('goes on over the plain road when the next road cannot be loaded', () => {
    const failed = walkOn(fightFirstMission({ nextRoad: 'fails' }));
    const first = failed.find((frame) => frame.mission === 1);
    expect(first.road).toBe(false);
    expect(first.drawn.some((call) => call.startsWith('drawImage('))).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { PROP_SPRITES } from '../../../src/data/prop-sprites.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { stageClear } from '../../../src/sim/stage/stage-clear.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// a road cleared with the hero on its last screen, run on until `done` holds, then drawn
function drawnWhen(missionIndex, done) {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const game = createTestGame();
  selectMission(game, missionIndex);
  startPlay(game);
  const { zones } = MISSIONS[missionIndex];
  const boss = zones.at(-1);
  Object.assign(game, { arena: { left: boss.left, right: boss.right } });
  game.stage.zoneIndex = zones.length - 1;
  game.camera.x = boss.left;
  game.player.x = boss.left + 200;
  stageClear(game);

  for (let ticks = 0; !done(game) && ticks < 1500; ticks++) {
    runTicks(game, 1);
  }

  screen.recording.log.length = 0;
  renderFrame(game, view);
  return { game, log: screen.recording.log };
}

const lastDraw = (log, file) =>
  log.findLastIndex((call) => call.startsWith(`drawImage(img(${file})`));
const heroDraws = (log) => log.filter((call) => call.includes('img(hero_'));
const halfWayIn = (game) => game.gateRun?.phase === 'enter' && game.gateRun.alpha < 0.6;

describe('the hero in a doorway', () => {
  it("is drawn faint, behind the door's frame but in its dark inside", () => {
    const { game, log } = drawnWhen(8, halfWayIn);
    const door = PROP_SPRITES[game.gateRun.doorway.wall.kind].file;
    const hero = log.findLastIndex((call) => call.includes('img(hero_'));
    const clip = log.indexOf('clip(evenodd)');
    expect(hero).toBeGreaterThan(-1);
    expect(clip).toBeGreaterThan(hero);
    expect(lastDraw(log, door)).toBeGreaterThan(clip);
    const faint = log.slice(0, hero).findLast((call) => call.startsWith('globalAlpha='));
    expect(Number(faint.split('=')[1])).toBeLessThan(0.6);
  });

  it("stands behind a broken fence's stakes, seen through its gaps", () => {
    const { game, log } = drawnWhen(0, halfWayIn);
    const fence = PROP_SPRITES[game.gateRun.doorway.wall.kind].file;
    const hero = log.findLastIndex((call) => call.includes('img(hero_'));
    expect(fence).toBe('palisadeBroken.png');
    expect(lastDraw(log, fence)).toBeGreaterThan(hero);
    expect(log).not.toContain('clip(evenodd)');
  });

  it('is not drawn at all once it has gone in', () => {
    const { log } = drawnWhen(8, (game) => game.gateRun?.phase === 'gone');
    expect(heroDraws(log)).toEqual([]);
  });
});

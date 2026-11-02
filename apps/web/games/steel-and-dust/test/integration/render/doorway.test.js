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
const halfIn = (game) => game.gateRun?.phase === 'enter' && game.gateRun.alpha < 0.6;

// the clip a hero in a doorway is drawn under, as the log has it
function heroClip(log) {
  const hero = log.findLastIndex((call) => call.includes('img(hero_'));
  const clip = log.slice(0, hero).findLastIndex((call) => call === 'clip()');

  return { hero, clip, area: log[clip - 1] };
}

describe('the hero in a doorway', () => {
  it("steps into a door's black hole: seen only in it, faint, the door drawn again round it", () => {
    const { game, log } = drawnWhen(8, halfIn);
    const { doorway } = game.gateRun;
    const { x, y, width } = doorway.opening;
    const { hero, clip, area } = heroClip(log);
    expect(doorway.dark).toBe(true);
    expect(clip).toBeGreaterThan(-1);
    expect(area).toBe(`rect(${x},${y},${width},2000)`);
    const faint = log.slice(clip, hero).filter((call) => call.startsWith('globalAlpha='));
    expect(faint.length).toBeGreaterThan(0);
    expect(faint.every((call) => Number(call.split('=')[1]) < 0.6)).toBe(true);
    const roundTheHole = log.indexOf('clip(evenodd)', hero);
    expect(roundTheHole).toBeGreaterThan(hero);
    expect(lastDraw(log, PROP_SPRITES[doorway.wall.kind].file)).toBeGreaterThan(roundTheHole);
  });

  it("steps out of the next road's door from its hole, faint at first", () => {
    const comingOut = (game) =>
      game.missionIndex === 9 && game.gateRun?.phase === 'emerge' && game.gateRun.alpha > 0.3;
    const { game, log } = drawnWhen(8, comingOut);
    const { doorway } = game.gateRun;
    const { x, y, width } = doorway.opening;
    expect(doorway.dark).toBe(true);
    expect(heroClip(log).area).toBe(`rect(${x},${y},${width},2000)`);
  });

  it('jumps over a broken fence in front of it, whole, with nothing drawn over it', () => {
    const overTheFence = (game) => game.gateRun?.phase === 'leap' && game.player.airborne;
    const { game, log } = drawnWhen(0, overTheFence);
    const fence = lastDraw(log, 'palisadeBroken.png');
    const hero = log.findLastIndex((call) => call.includes('img(hero_'));
    expect(game.gateRun.doorway.wall.kind).toBe('palisadeBroken');
    expect(hero).toBeGreaterThan(fence);
    expect(log.slice(fence, hero).filter((call) => call.startsWith('clip('))).toEqual([]);
  });

  it('is not drawn at all once it has gone in', () => {
    const { log } = drawnWhen(8, (game) => game.gateRun?.phase === 'gone');
    expect(heroDraws(log)).toEqual([]);
  });
});

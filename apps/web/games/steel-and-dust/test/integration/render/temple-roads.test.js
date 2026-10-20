import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
import { PAINTED_BACKDROPS } from '../../../src/data/backdrops/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { PROP_SPRITES } from '../../../src/data/prop-sprites.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { FakeImage } from '../../support/fake-image.js';
import { pngSize } from '../../support/png-size.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const GAME_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const angkor = MISSIONS.find((mission) => mission.theme === 'angkorWat');
const bayon = MISSIONS.find((mission) => mission.theme === 'bayon');

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// a temple road drawn with the camera parked at cameraX
function renderAt(mission, cameraX) {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const game = createTestGame();
  selectMission(game, mission.index);
  startPlay(game);
  runTicks(game, 2);
  game.camera.x = cameraX;
  screen.recording.log.length = 0;
  renderFrame(game, view);
  return screen.recording.log;
}

function drawsOf(log, name) {
  return log
    .filter((call) => call.startsWith(`drawImage(img(${name})`))
    .map((call) => call.slice(10, -1).split(',').slice(1).map(Number));
}

describe('the temple roads', () => {
  it("walk on from Warden's Fortress, Angkor Wat at dawn and then the Bayon at dusk", () => {
    expect([angkor.number, bayon.number]).toEqual([11, 12]);
    expect(MISSIONS[angkor.index - 1].theme).toBe('wardenFortress');
    expect(bayon).toBe(MISSIONS.at(-1));
  });

  for (const temple of [angkor, bayon]) {
    const before = MISSIONS[temple.index - 1];
    const { folder } = PAINTED_BACKDROPS[temple.theme];
    const wayIn = PAINTED_BACKDROPS[temple.theme].layers.find((layer) => layer.once);

    it(`open ${temple.name} on ${before.name}'s gate broken open and the last of its road`, () => {
      expect(temple.entry).toBe(`${before.endWall}Broken`);
      const log = renderAt(temple, 0);
      expect(drawsOf(log, PROP_SPRITES[temple.entry].file)).toHaveLength(1);
      const [[startX]] = drawsOf(log, `${wayIn.name}.png`);
      expect(startX).toBe(0);
      const { width } = pngSize(join(GAME_ROOT, `assets/backdrops/${folder}/${wayIn.name}.png`));
      const gone = Math.ceil(width / wayIn.parallax) + 1;
      expect(drawsOf(renderAt(temple, gone), `${wayIn.name}.png`)).toEqual([]);
    });

    it(`show ${temple.name}'s whole temple gate on the last screen, its feet on the road`, () => {
      const lastCamera = temple.length - VIEW_WIDTH;
      const gate = temple.props.at(-1);
      expect(gate.kind).toBe('templeGate');
      const [[x, y, width]] = drawsOf(renderAt(temple, lastCamera), 'temple-gate.png');
      expect(x).toBeGreaterThanOrEqual(lastCamera);
      expect(x + width).toBeLessThanOrEqual(temple.length + 4);
      expect(y + PROP_SPRITES.templeGate.feetY / 2).toBe(gate.y);
    });
  }

  it("raises Angkor Wat's sanctuary 16px above the road for the Naga Raja", () => {
    const sanctuary = angkor.zones.at(-1);
    expect(sanctuary.boss).toBe('naga');
    expect(groundAt(angkor.terrain, sanctuary.left)).toBe(GROUND_Y - 16);
    expect(groundAt(angkor.terrain, angkor.length - 1)).toBe(GROUND_Y - 16);
  });

  it("hangs the Bayon's canopy of fig roots over the fighters", () => {
    const log = renderAt(bayon, 0);
    const lastHero = log.findLastIndex((call) => call.includes('img(hero_'));
    const canopy = log.findIndex((call) => call.startsWith('drawImage(img(canopy.png)'));
    expect(canopy).toBeGreaterThan(lastHero);
  });
});

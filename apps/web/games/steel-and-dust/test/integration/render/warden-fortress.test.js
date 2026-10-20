import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GROUND_Y, VIEW_WIDTH } from '../../../src/config.js';
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
const RUINS = 'assets/backdrops/warden-fortress/ruins.png';
const fortress = MISSIONS.find((mission) => mission.theme === 'wardenFortress');

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// the fortress road drawn with the camera parked at cameraX
function renderAt(cameraX) {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const game = createTestGame();
  selectMission(game, fortress.index);
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

describe("the Warden's Fortress road", () => {
  it('is the tenth mission, ending on the Warden Ox, and its road walks on into Angkor Wat', () => {
    expect(fortress.number).toBe(10);
    expect(fortress.boss).toBe('brute');
    expect(MISSIONS[fortress.index + 1].theme).toBe('angkorWat');
  });

  it('starts among the sun temple ruins, which the road leaves behind', () => {
    const [[startX]] = drawsOf(renderAt(0), 'ruins.png');
    expect(startX).toBe(0);
    const width = pngSize(join(GAME_ROOT, RUINS)).width;
    const [[leavingX]] = drawsOf(renderAt(width), 'ruins.png');
    expect(leavingX).toBeLessThan(0);
    expect(drawsOf(renderAt(fortress.length - VIEW_WIDTH), 'ruins.png')).toEqual([]);
  });

  it("climbs a last flight of stairs to the Warden Hall, closed by the Warden's gate", () => {
    const hall = fortress.zones.at(-1);
    expect(hall.label).toBe('Warden Hall');
    expect(groundAt(fortress.terrain, hall.left)).toBe(GROUND_Y - 16);
    const gate = fortress.props.at(-1);
    expect(gate.kind).toBe('wardenGate');
    expect(gate.y).toBe(GROUND_Y - 16);
  });

  it('shows the whole gate on the last screen, its feet on the hall floor', () => {
    const lastCamera = fortress.length - VIEW_WIDTH;
    const [[x, y, width, height]] = drawsOf(renderAt(lastCamera), 'warden-gate.png');
    expect(x).toBeGreaterThanOrEqual(lastCamera);
    expect(x + width).toBeLessThanOrEqual(fortress.length + 4);
    expect(y + height).toBeGreaterThan(GROUND_Y - 16);
    expect(y + PROP_SPRITES.wardenGate.feetY / 2).toBe(GROUND_Y - 16);
  });

  it('builds its ramparts from their own sprite', () => {
    const kinds = new Set(fortress.terrain.platforms.map((platform) => platform.kind));
    expect([...kinds]).toEqual(['rampart']);
    const firstDeck = fortress.terrain.platforms[0];
    expect(drawsOf(renderAt(firstDeck.x - 100), 'rampart.png').length).toBeGreaterThan(0);
  });
});

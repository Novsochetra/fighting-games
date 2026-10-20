import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { PAINTED_THEMES } from '../../../src/art/painted-themes/index.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { createView } from '../../../src/render/create-view.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { FakeImage } from '../../support/fake-image.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const temple = MISSIONS.find((mission) => mission.theme === 'mirageTemple');
const air = PAINTED_THEMES.mirageTemple.ambient;

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// renders the road with the camera parked at a spot, after a few ticks so the air is moving
function renderAt(cameraX) {
  const screen = createCanvas(768, 432);
  const view = createView({
    context: screen.getContext('2d'),
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const game = createTestGame();
  selectMission(game, temple.index);
  startPlay(game);
  runTicks(game, 30);
  game.camera.x = cameraX;
  screen.recording.log.length = 0;
  renderFrame(game, view);
  return screen.recording.log;
}

const images = (log) =>
  log.filter((call) => call.startsWith('drawImage(')).map((call) => call.split(',')[0].slice(10));

describe('the Mirage Temple road', () => {
  it('is the ninth mission, painted at dusk past the iron works', () => {
    expect(temple.number).toBe(9);
    const drawn = images(renderAt(0));
    expect(drawn[0]).toBe('img(back.png)');
    expect(drawn).toEqual(expect.arrayContaining(['img(horizon.png)', 'img(works.png)']));
    expect(drawn.indexOf('img(horizon.png)')).toBeLessThan(drawn.indexOf('img(near.png)'));
    expect(drawn.indexOf('img(near.png)')).toBeLessThan(drawn.indexOf('img(works.png)'));
  });

  it('burns blue flames on the braziers flanking the Serpent Shrine', () => {
    const shrine = temple.zones.find((zone) => zone.label === 'Serpent Shrine');
    const log = renderAt(shrine.left);
    for (const color of air.flame) {
      expect(log, color).toContain(`fillStyle=${color}`);
    }
  });

  it('closes the road with the sealed temple door at the Sun Throne', () => {
    const door = temple.props.at(-1);
    expect(door.kind).toBe('templeDoor');
    expect(images(renderAt(temple.length - 384))).toContain('img(temple-door.png)');
  });

  it('rises over dunes and temple steps onto slabs, with flat ground for both bosses', () => {
    for (const zone of temple.zones) {
      const heights = new Set();
      for (let x = zone.left; x <= zone.right; x++) {
        heights.add(groundAt(temple.terrain, x));
      }
      expect(heights.size > 1, zone.label).toBe(!zone.boss);
    }
    expect(temple.terrain.platforms.length).toBeGreaterThanOrEqual(4);
    expect(new Set(temple.terrain.platforms.map((platform) => platform.kind))).toEqual(
      new Set(['slab']),
    );
    expect(Math.min(...temple.terrain.heights)).toBe(GROUND_Y - 40);
  });
});

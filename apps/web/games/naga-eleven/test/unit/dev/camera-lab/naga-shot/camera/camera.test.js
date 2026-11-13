import { describe, expect, it } from 'vitest';

import { cameraAt, shakeAt } from '../../../../../../dev/camera-lab/src/naga-shot/camera/camera.js';
import { NAGA_SHOTS } from '../../../../../../dev/camera-lab/src/naga-shot/camera/shots.js';
import { NAGA_TIMINGS } from '../../../../../../dev/camera-lab/src/naga-shot/sequence.js';
import { ballAt } from '../../../../../../dev/camera-lab/src/naga-shot/tracks/ball.js';
import {
  ENDINGS,
  UNITS,
  VIEW,
  WORLD,
} from '../../../../../../dev/camera-lab/src/naga-shot/world.js';
import { BAR } from '../../../../../../src/render/duel/layout.js';
import { everyClock, EVERY_CASE } from '../every-clock.js';

const camerasOf = (settings) =>
  everyClock(settings).map((clock) => cameraAt(clock, { ...settings, shake: true }));

describe("the Naga Shot's camera", () => {
  it.each(EVERY_CASE)(
    'draws a whole number of pixels to an art pixel and stays in the world (%s)',
    (_, settings) => {
      for (const camera of camerasOf(settings)) {
        const halfWidth = VIEW.width / 2 / camera.unit;
        const halfHeight = VIEW.height / 2 / camera.unit;

        expect(Number.isInteger(camera.unit)).toBe(true);
        expect(camera.unit).toBeGreaterThanOrEqual(UNITS.least);
        expect(camera.unit).toBeLessThanOrEqual(UNITS.most);
        expect(camera.x - halfWidth).toBeGreaterThanOrEqual(0);
        expect(camera.x + halfWidth).toBeLessThanOrEqual(WORLD.width);
        expect(camera.y - halfHeight).toBeGreaterThanOrEqual(0);
        expect(camera.y + halfHeight).toBeLessThanOrEqual(WORLD.height);
      }
    },
  );

  it('zooms in for the big beats on a full camera, and never on Off', () => {
    const units = (camera) =>
      new Set(camerasOf({ camera, ending: 'goal' }).map((each) => each.unit));

    expect(units('full').size).toBeGreaterThan(2);
    expect([...units('off')]).toEqual([UNITS.least]);
  });

  it('shakes in whole art pixels at the kick and the crash, and holds still between', () => {
    const clocks = everyClock({ camera: 'full' });
    const contact = clocks.find(
      (clock) => clock.stage === 'impact' && clock.ticks === NAGA_TIMINGS.contact,
    );
    const crash = clocks.find((clock) => clock.stage === 'collision');
    const flying = clocks.find((clock) => clock.stage === 'flight' && clock.ticks === 40);
    const shakes = clocks.slice(contact.frame, contact.frame + 8).map(shakeAt);

    expect(shakes.some((shake) => shake.x !== 0 || shake.y !== 0)).toBe(true);
    expect(shakes.every((shake) => Number.isInteger(shake.x) && Number.isInteger(shake.y))).toBe(
      true,
    );
    expect(
      clocks
        .slice(crash.frame, crash.frame + 8)
        .map(shakeAt)
        .some((shake) => shake.x !== 0),
    ).toBe(true);
    expect(shakeAt(flying)).toEqual({ x: 0, y: 0 });
  });

  // the film bars are the duel's, three of the lab's pixels to one of theirs
  const shows = (camera, { x, y }) =>
    Math.abs(x - camera.x) <= VIEW.width / 2 / camera.unit &&
    Math.abs(y - camera.y) <= (VIEW.height / 2 - BAR * 3) / camera.unit;

  const watchesTheBall = (clock, ending) => {
    const cut = NAGA_SHOTS.aftermath.find((shot) => shot.on === 'hero').from;
    const onTheScorer = ending === 'goal' && clock.stage === 'aftermath' && clock.full >= cut;

    return clock.stage === 'keeper' ? clock.share >= 0.2 : !onTheScorer;
  };

  it.each(ENDINGS)(
    "keeps the ball between the film bars from the keeper's look on, on a full camera (%s)",
    (ending) => {
      const settings = { camera: 'full', ending };
      const keeper = everyClock(settings).findIndex((clock) => clock.stage === 'keeper');
      const clocks = everyClock(settings).slice(keeper);

      for (const clock of clocks.filter((each) => watchesTheBall(each, ending))) {
        expect(shows(cameraAt(clock, { ...settings, shake: false }), ballAt(clock, ending))).toBe(
          true,
        );
      }
    },
  );

  it('holds still when the shake is hidden', () => {
    const clock = everyClock({ camera: 'full' }).find((each) => each.stage === 'collision');

    expect(cameraAt(clock, { ending: 'goal', camera: 'full', shake: false }).shake).toEqual({
      x: 0,
      y: 0,
    });
  });
});

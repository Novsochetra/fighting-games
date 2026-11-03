import { describe, expect, it } from 'vitest';

import { ballAt, trailOf } from '../../../../src/render/save-cam/flight.js';
import { camMoment } from '../../../../src/render/save-cam/moment.js';
import { BEATS, contactTick } from '../../../../src/render/save-cam/timing.js';
import { DEPTH, project } from '../../../../src/render/save-cam/view.js';

const momentOf = (raw) => camMoment({ aim: { side: 0.5, height: 0.5 }, dive: 1, ...raw });

const contact = contactTick();

describe("the ball's flight in the save cam", () => {
  it('is struck at the strike, flies away from the camera and meets the keeper at the contact', () => {
    const moment = momentOf({ result: 'goal' });
    const depths = [BEATS.strike, 20, 30, contact].map((tick) => ballAt(moment, tick).z);

    expect(ballAt(moment, BEATS.strike - 1).gone).toBe(true);
    expect(depths).toEqual([...depths].sort((first, second) => first - second));
    expect(ballAt(moment, contact).z).toBeCloseTo(DEPTH.keeper, 5);
    expect(ballAt(momentOf({ result: 'saved' }), contact).held).toBe(true);
  });

  it('holds still through the hit-stop, then plays on', () => {
    const moment = momentOf({ result: 'goal' });
    const held = ballAt(moment, contact);

    for (let tick = contact; tick < contact + BEATS.hitStop; tick += 1) {
      expect(ballAt(moment, tick)).toEqual(held);
    }

    expect(ballAt(moment, contact + BEATS.hitStop + 2).z).toBeGreaterThan(held.z);
  });

  it('sits in his gloves for a catch, in the net for a goal, and comes back off a wall', () => {
    const late = contact + 40;

    expect(ballAt(momentOf({ result: 'saved' }), late).held).toBe(true);
    expect(ballAt(momentOf({ result: 'goal' }), late).z).toBeGreaterThan(DEPTH.line);
    expect(ballAt(momentOf({ result: 'saved', style: 'wall' }), late).z).toBeLessThan(
      DEPTH.keeper - 3,
    );
  });

  it('flies out wide of the frame off a punch, and past the post on a miss', () => {
    const punched = ballAt(momentOf({ result: 'parried', style: 'punch' }), contact + 30);
    const wide = ballAt(momentOf({ result: 'wide', aim: { side: 1.2, height: 0.5 } }), contact + 8);

    expect(project(punched).x).toBeGreaterThan(project({ x: 3.66, y: 0, z: punched.z }).x);
    expect(project(wide).x).toBeGreaterThan(project({ x: 3.66, y: 0, z: wide.z }).x);
  });

  it('never goes below the grass', () => {
    for (const style of ['wall', 'punch', 'catch']) {
      for (let tick = 0; tick < 120; tick += 1) {
        const at = ballAt(
          momentOf({ result: style === 'catch' ? 'parried' : 'saved', style }),
          tick,
        );

        expect(at.held || at.y > 0).toBe(true);
      }
    }
  });

  it('leaves a trail of where it flew free, ending where it is now', () => {
    const moment = momentOf({ result: 'saved' });
    const trail = trailOf(moment, 30);

    expect(trail.length).toBeGreaterThan(5);
    expect(trail.at(-1)).toEqual({ ...ballAt(moment, 30), tick: 30 });
    expect(trailOf(moment, contact + 30)).toEqual([]);
  });
});

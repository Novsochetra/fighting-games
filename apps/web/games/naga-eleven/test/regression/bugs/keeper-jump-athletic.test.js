import { describe, expect, it } from 'vitest';

import {
  DIVE_FRAMES,
  DIVE_INKS,
  DIVE_KIT_LETTERS,
} from '../../../src/art/save-cam/keeper-dive/index.js';
import { DIVE_BEATS, restOf } from '../../../src/render/save-cam/dive-frames.js';
import { keeperPose } from '../../../src/render/save-cam/keeper-pose.js';
import { camMoment } from '../../../src/render/save-cam/moment.js';
import { contactTick, playTicks } from '../../../src/render/save-cam/timing.js';
import { DEPTH, project } from '../../../src/render/save-cam/view.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { drawnSaveCam, pixelsIn } from '../../support/save-cam-pixels.js';

// The keeper's dive from the front did not look like a keeper's: he waited standing straight up,
// arms hanging at his sides; pushed off upright with both arms straight up over his head, like a
// standing jump with his hands raised; and snapped from there into the diagonal stretch with no
// take-off between, so the jump had no motion. He now waits in a keeper's ready stance, loads on
// his near leg leaning to the ball with both arms swinging across to it, and leaves the grass on a
// take-off frame of its own, his boots off it, on one arc into the stretch.
const GROUND = Math.round(project({ x: 0, y: 0, z: DEPTH.keeper }).y);
const GLOVE = new Set(['G', 'H', 'I', 'J']);
const BOOT = new Set(['K', 'L', 'M', 'N']);

const AIMS = [
  { side: 0.75, height: 0.85 },
  { side: -0.7, height: 0.5 },
  { side: 0.8, height: 0.1 },
];

const pixelsOf = (map, wanted) =>
  map.rows.flatMap((row, y) => [...row].flatMap((letter, x) => (wanted(letter) ? [{ x, y }] : [])));

const ofPart = (map, part) => pixelsOf(map, (letter) => DIVE_KIT_LETTERS[letter]?.[0] === part);

const spanOf = (pixels) => {
  const xs = pixels.map((pixel) => pixel.x);

  return { left: Math.min(...xs), right: Math.max(...xs) };
};

// a frame's gloves, left and right of his navel, each as its own pixels
function glovesOf(map) {
  const gloves = pixelsOf(map, (letter) => GLOVE.has(letter));

  return [
    gloves.filter((pixel) => pixel.x < map.anchor.x),
    gloves.filter((pixel) => pixel.x > map.anchor.x),
  ];
}

describe("the keeper's jump in the save cam reads as a real keeper's dive", () => {
  it('waits in the ready stance: feet wider than his shoulders, gloves out in front of his waist', () => {
    const set = DIVE_FRAMES.set;
    const shirt = spanOf(ofPart(set, 'shirt'));
    const boots = spanOf(pixelsOf(set, (letter) => BOOT.has(letter)));
    const shorts = spanOf(ofPart(set, 'shorts'));

    expect(boots.left).toBeLessThan(shirt.left);
    expect(boots.right).toBeGreaterThan(shirt.right);

    for (const glove of glovesOf(set)) {
      const middle = glove.reduce((sum, pixel) => sum + pixel.y, 0) / glove.length;
      const span = spanOf(glove);

      expect(glove.length).toBeGreaterThan(40);
      expect(Math.abs(middle - set.anchor.y)).toBeLessThan(6);
      expect(span.right >= shorts.left && span.left <= shorts.right).toBe(true);
    }
  });

  it('loads with both gloves swinging to the ball, not both straight up over his head', () => {
    for (const [height, map] of Object.entries(DIVE_FRAMES.push)) {
      const gloves = pixelsOf(map, (letter) => GLOVE.has(letter));
      const head = Math.min(...ofPart(map, 'hair').map((pixel) => pixel.y));

      expect(gloves.length, height).toBeGreaterThan(80);
      expect(
        gloves.every((pixel) => pixel.x > map.anchor.x),
        height,
      ).toBe(true);
      expect(Math.max(...gloves.map((pixel) => pixel.y)), height).toBeGreaterThan(head);
    }
  });

  it.each(AIMS.map((aim) => [JSON.stringify(aim), aim]))(
    'leaves the grass on a take-off of its own between the load and the stretch, at %s',
    (name, aim) => {
      const moment = camMoment({ result: 'saved', aim, dive: Math.sign(aim.side) });
      const poses = [];

      for (let since = DIVE_BEATS.push; since < DIVE_BEATS.stretch; since += 1) {
        poses.push(keeperPose(moment, contactTick() + since));
      }

      const takeoff = poses.find((pose) => pose.frame === 'takeoff');

      expect(poses[0].frame).toBe('push');
      expect(takeoff).toBeDefined();
      expect(takeoff.y + restOf(takeoff.figure)).toBeLessThanOrEqual(GROUND - 2);
    },
  );

  it('casts his shadow apart from his boots as he leaves the grass, either way', () => {
    const match = fakeMatch({ seed: 3 });

    match.teams = [{ kit: 'cambodia' }, { kit: 'japan' }];

    for (const aim of AIMS) {
      const moment = { shooter: 9, keeper: 0, move: 'power-shot', result: 'saved', style: 'catch' };
      const ticks = contactTick() + (DIVE_BEATS.takeoff ?? DIVE_BEATS.stretch);
      const { cam, colourAt } = drawnSaveCam(
        match,
        { ...moment, aim, dive: Math.sign(aim.side) },
        {
          ticks,
        },
      );
      const pose = keeperPose(cam.moment, playTicks(ticks));
      const under = { x: pose.x - 45, y: GROUND - 1, width: 91, height: 2 };
      const boots = [...BOOT].map((letter) => DIVE_INKS[letter]);

      expect(pose.frame, JSON.stringify(aim)).toBe('takeoff');
      expect(pixelsIn(colourAt, [...boots, DIVE_INKS[0]], under), JSON.stringify(aim)).toEqual([]);
    }
  });
});

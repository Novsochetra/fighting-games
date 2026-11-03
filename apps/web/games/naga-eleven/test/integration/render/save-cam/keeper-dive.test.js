import { describe, expect, it } from 'vitest';

import { BALL_PALETTE } from '../../../../src/art/duel/ball.js';
import { DIVE_FRAMES, DIVE_INKS } from '../../../../src/art/save-cam/keeper-dive/index.js';
import { looksOf } from '../../../../src/render/actors/looks.js';
import { columnOf } from '../../../../src/render/save-cam/dive-figure.js';
import { KEEPER_SHARE, shotPoint } from '../../../../src/render/save-cam/flight.js';
import { keeperPose } from '../../../../src/render/save-cam/keeper-pose.js';
import { BEATS, contactTick, playTicks } from '../../../../src/render/save-cam/timing.js';
import { project } from '../../../../src/render/save-cam/view.js';
import { fakeMatch } from '../../../support/duel-fixtures.js';
import { drawnSaveCam, lineOf, pixelsIn } from '../../../support/save-cam-pixels.js';

// past the flash and the shake and before he comes down: the full stretch, nothing over it
const STRETCH = contactTick() + BEATS.hitStop + 5;

const GLOVES = ['G', 'H', 'I', 'J'].map((letter) => DIVE_INKS[letter]);
const BALL = [1, 2, 3, 4, 'p', 'q'].map((shade) => BALL_PALETTE[shade]);

// Cambodia's keeper (Dara's shirt) against Japan
function cambodiaMatch() {
  const match = fakeMatch({ seed: 3 });

  match.teams = [{ kit: 'cambodia' }, { kit: 'japan' }];

  return match;
}

const catchAt = (side) => ({
  shooter: 9,
  keeper: 0,
  move: 'power-shot',
  result: 'saved',
  style: 'catch',
  aim: { side, height: 0.9 },
  dive: Math.sign(side),
});

// the save cam at the full stretch, with his pose and look
function stretchOf(moment) {
  const match = cambodiaMatch();
  const drawn = drawnSaveCam(match, moment, { ticks: STRETCH });

  return {
    ...drawn,
    look: looksOf(match).players[0],
    pose: keeperPose(drawn.cam.moment, playTicks(STRETCH)),
  };
}

// the middle of his chest on the art grid, as the frame he is in puts it
function chestOf(pose) {
  const map = pose.figure;

  return {
    x: pose.x - columnOf(map, map.anchor.x, pose.mirror) + columnOf(map, map.number.x, pose.mirror),
    y: pose.y - map.anchor.y + map.number.y,
  };
}

describe("the keeper's dive in the save cam, drawn", () => {
  it('flies on a diagonal up to the top corner, either way', () => {
    for (const side of [0.85, -0.85]) {
      const { colourAt, look, pose } = stretchOf(catchAt(side));
      const kit = pixelsIn(colourAt, look.shirt);
      const line = lineOf(kit);

      expect(pose.figure).toBe(DIVE_FRAMES.high.catch);
      expect(kit.length, String(side)).toBeGreaterThan(250);
      expect(Math.abs(line.rise), String(side)).toBeGreaterThan(25);
      expect(Math.abs(line.rise), String(side)).toBeLessThan(50);
      expect(Math.sign(line.rise)).toBe(Math.sign(side));
      expect(line.length / line.width, String(side)).toBeGreaterThan(2);
    }
  });

  it('holds the ball in both gloves, where the shot meets him', () => {
    const moment = catchAt(0.85);
    const { colourAt, pose } = stretchOf(moment);
    const contact = project(shotPoint(moment.aim, KEEPER_SHARE));
    const near = (radius) => ({
      x: pose.gloves.x - radius,
      y: pose.gloves.y - radius,
      width: radius * 2 + 1,
      height: radius * 2 + 1,
    });
    const gloves = pixelsIn(colourAt, GLOVES, near(9));

    expect(Math.hypot(pose.gloves.x - contact.x, pose.gloves.y - contact.y)).toBeLessThan(3);
    expect(pixelsIn(colourAt, [BALL_PALETTE.p], near(4)).length).toBeGreaterThan(3);
    expect(pixelsIn(colourAt, BALL, near(4)).length).toBeGreaterThan(40);
    expect(gloves.filter((pixel) => pixel.x < pose.gloves.x - 2).length).toBeGreaterThan(6);
    expect(gloves.filter((pixel) => pixel.x > pose.gloves.x + 2).length).toBeGreaterThan(6);
  });

  it('wears his shirt number on his chest, the right way round, either way he dives', () => {
    for (const side of [0.85, -0.85]) {
      const { colourAt, look, pose } = stretchOf(catchAt(side));
      const chest = chestOf(pose);
      const ink = look.numberColours.fill;
      const one = [
        [0, -2],
        [-1, -1],
        [0, -1],
        [0, 0],
        [0, 1],
        [0, 2],
      ];

      for (const [dx, dy] of one) {
        expect(colourAt(chest.x + dx, chest.y + dy), `${side} ${dx},${dy}`).toBe(ink);
      }

      expect(look.shirt, String(side)).toContain(colourAt(chest.x - 1, chest.y - 2));
    }
  });

  it('casts his shadow on the grass with daylight between it and him', () => {
    const { colourAt, look, pose } = stretchOf(catchAt(0.85));
    const kit = pixelsIn(colourAt, [...look.shirt, ...look.socks]);
    const ground = Math.round(project({ x: 0, y: 0, z: 10.2 }).y);

    expect(Math.max(...kit.map((pixel) => pixel.y))).toBeLessThan(ground - 15);
    expect(colourAt(pose.shadow.x, ground)).not.toBe(colourAt(pose.shadow.x, ground + 6));
  });
});

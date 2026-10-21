import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { POUNDING_LION } from '../../../src/data/ultimates/pounding-lion.js';
import { LION_RISE_TICKS } from '../../../src/sim/summons/lions.js';
import {
  prideFlight,
  pridePosts,
  prideSchedule,
  riseOrder,
} from '../../../src/sim/ultimates/lion-pride.js';

const { prideAt, pride, pounceAt, cascade } = POUNDING_LION;
const CAMERA = 500;
const flat = () => 180;
const lay = { middle: CAMERA + VIEW_WIDTH / 2, facing: 1, ground: flat, scale: 0.5, run: 64 };

describe("the lion pride's row", () => {
  it('stands one lion on each post, left to right, all on screen', () => {
    const posts = pridePosts(CAMERA, CAMERA + VIEW_WIDTH / 2);
    expect(posts).toHaveLength(pride.length);
    expect(posts).toEqual([...posts].sort((first, second) => first - second));
    expect(Math.min(...posts)).toBeGreaterThan(CAMERA);
    expect(Math.max(...posts)).toBeLessThan(CAMERA + VIEW_WIDTH);
  });

  it('leaves a gap round the hero, even with his back to the screen edge', () => {
    for (const heroX of [CAMERA + 20, CAMERA + 150, CAMERA + VIEW_WIDTH - 20]) {
      const posts = pridePosts(CAMERA, heroX);
      const nearest = Math.min(...posts.map((x) => Math.abs(x - heroX)));
      expect(nearest, `hero at ${heroX}`).toBeGreaterThanOrEqual(10);
      expect(posts).toHaveLength(pride.length);
    }
  });

  it('wakes the posts nearest the hero first', () => {
    const heroX = CAMERA + 100;
    const posts = pridePosts(CAMERA, heroX);
    const distances = riseOrder(posts, heroX).map((post) => Math.abs(posts[post] - heroX));
    expect(distances).toEqual([...distances].sort((first, second) => first - second));
  });
});

describe("the lion pride's timing", () => {
  const schedule = prideSchedule();
  const leapsAt = schedule.map(({ delay, appear }) => prideAt + delay + appear);
  const landsAt = schedule.map(({ delay, appear, run }) => prideAt + delay + appear + run);

  it('lets every lion rise all the way before it bounds off', () => {
    schedule.forEach(({ appear }) => expect(appear).toBeGreaterThanOrEqual(LION_RISE_TICKS));
  });

  it('never sends two lions off on the same tick', () => {
    expect(new Set(leapsAt).size).toBe(pride.length);
  });

  it('lands them one after another, the biggest last as the hero strikes', () => {
    landsAt.slice(1).forEach((tick, i) => expect(tick - landsAt[i]).toBe(cascade));
    expect(landsAt.at(-1)).toBe(pounceAt);
    const scales = schedule.map(({ scale }) => scale);
    expect(new Set(scales).size).toBeGreaterThan(pride.length / 2);
    expect(scales.at(-1)).toBe(Math.max(...scales));
  });
});

describe("a pride lion's run", () => {
  const posts = pridePosts(CAMERA, CAMERA + VIEW_WIDTH / 2);
  const half = pride.length / 2;

  it('bounds to the post the other half stood on, then onto the middle', () => {
    const flight = prideFlight(posts, 1, lay);
    expect(flight[0][1]).toBe(posts[1]);
    expect(flight[2][1]).toBe(posts[1 + half]);
    expect(Math.abs(flight.at(-1)[1] - lay.middle)).toBeLessThan(40);
    expect(flight.at(-1)[0]).toBe(lay.run);
  });

  it('leaps high going the way the hero faces and low the other way', () => {
    const facingWay = prideFlight(posts, 0, lay)[1][3];
    const otherWay = prideFlight(posts, half, lay)[1][3];
    expect(facingWay).toBeGreaterThan(otherWay);
    const turned = { ...lay, facing: -1 };
    expect(prideFlight(posts, half, turned)[1][3]).toBe(facingWay);
  });

  it('leaps higher the bigger the lion', () => {
    const small = prideFlight(posts, 0, lay);
    const big = prideFlight(posts, 0, { ...lay, scale: 0.7 });
    expect(big[1][3]).toBeGreaterThan(small[1][3]);
    expect(big.at(-1)[3]).toBeGreaterThan(small.at(-1)[3]);
  });
});

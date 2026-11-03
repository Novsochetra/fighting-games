import { describe, expect, it } from 'vitest';
import { DRILLS } from '../../../../src/data/training.js';
import {
  createCourse,
  LANE,
  limitTicks,
  parTicks,
} from '../../../../src/training/cone-dribble/course.js';
import { createRandom } from '../../../../src/sim/random.js';

const TUNING = DRILLS['cone-dribble'].tuning;

const courseOf = (seed, level) => createCourse(createRandom(seed), { tuning: TUNING, level });

describe('the cone course', () => {
  it('lays the same course for the same seed, and another for another seed', () => {
    expect(courseOf(4, 2)).toEqual(courseOf(4, 2));
    expect(courseOf(4, 2)).not.toEqual(courseOf(5, 2));
  });

  it('grows longer and tighter with the level', () => {
    const easy = courseOf(1, 1);
    const hard = courseOf(1, 3);
    const gapOf = (course) => course.cones[1].x - course.cones[0].x;

    expect(easy.cones).toHaveLength(TUNING.cones);
    expect(hard.cones).toHaveLength(TUNING.cones + TUNING.conesPerLevel * 2);
    expect(gapOf(hard)).toBeLessThan(gapOf(easy));
  });

  it('starts with a straight line of cones, then sways', () => {
    const { cones } = courseOf(7, 1);
    const third = Math.floor(cones.length / 3);

    expect(new Set(cones.slice(0, third).map((cone) => cone.y))).toEqual(new Set([LANE.width / 2]));
    expect(new Set(cones.slice(third).map((cone) => cone.y)).size).toBeGreaterThan(1);
  });

  it('asks for each cone to be passed on the other side from the one before', () => {
    const { cones } = courseOf(7, 1);

    cones.forEach((cone, i) => expect(cone.side).toBe(i % 2 === 0 ? 'far' : 'near'));
  });

  it('keeps every swing between two cones one a runner can make', () => {
    for (const level of [1, 2, 3, 4, 5]) {
      const { cones } = courseOf(level * 11, level);

      cones.slice(1).forEach((cone, i) => {
        const along = cone.x - cones[i].x;

        expect(Math.abs(cone.y - cones[i].y)).toBeLessThanOrEqual(along * 0.36);
      });
    }
  });

  it('keeps every cone, its side and its mannequin inside the lane at any level', () => {
    for (const level of [1, 3, 5, 9]) {
      const course = courseOf(level * 3, level);

      for (const cone of course.cones) {
        expect(cone.y - 30).toBeGreaterThan(0);
        expect(cone.y + 30).toBeLessThan(LANE.width);
      }

      for (const mannequin of course.mannequins) {
        expect(mannequin.y).toBeGreaterThan(0);
        expect(mannequin.y).toBeLessThan(LANE.width);
      }
    }
  });

  it('stands mannequins by the last cones only from the level the tuning says', () => {
    expect(courseOf(2, 1).mannequins).toEqual([]);

    const course = courseOf(2, TUNING.mannequinsFromLevel);
    const lastThird = course.cones.slice(Math.floor((course.cones.length * 2) / 3));

    expect(course.mannequins.length).toBeGreaterThan(0);

    for (const mannequin of course.mannequins) {
      expect(lastThird.some((cone) => cone.x === mannequin.x)).toBe(true);
    }
  });

  it('puts the finish past the last cone and the goal past the finish', () => {
    const course = courseOf(1, 1);

    expect(course.finishX).toBeGreaterThan(course.cones.at(-1).x);
    expect(course.goalX).toBeGreaterThan(course.finishX);
    expect(limitTicks(course, TUNING)).toBeGreaterThan(parTicks(course, TUNING));
  });
});

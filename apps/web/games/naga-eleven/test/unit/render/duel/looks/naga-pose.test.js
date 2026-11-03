import { describe, expect, it } from 'vitest';

import { headPoint, jawsOffset, NAPE } from '../../../../../src/render/duel/looks/naga-head.js';
import { facingOf, headPose, joinedNeck } from '../../../../../src/render/duel/looks/naga-pose.js';

const line = (from, to, count = 8) =>
  Array.from({ length: count }, (_, i) => ({
    x: from.x + ((to.x - from.x) * i) / (count - 1),
    y: from.y + ((to.y - from.y) * i) / (count - 1),
    radius: 3,
  }));

describe("the Naga's head on its body", () => {
  it('faces the way the body swims to the ball', () => {
    expect(facingOf(line({ x: 0, y: 50 }, { x: 60, y: 40 }), { x: 70, y: 40 })).toBe(1);
    expect(facingOf(line({ x: 90, y: 50 }, { x: 30, y: 40 }), { x: 20, y: 40 })).toBe(-1);
  });

  it('holds the ball in its jaws at any size and facing', () => {
    const points = line({ x: 120, y: 120 }, { x: 80, y: 90 });
    const ball = { x: 70, y: 84 };

    for (const size of [0.9, 1.9, 3.6]) {
      const head = headPose(points, { ball, size });
      const jaws = jawsOffset(head);

      expect(head.facing).toBe(-1);
      expect(head.x + jaws.x).toBeCloseTo(ball.x, 6);
      expect(head.y + jaws.y).toBeCloseTo(ball.y, 6);
    }
  });

  it('stays in profile when the ball climbs straight up, its snout lifted toward the climb', () => {
    const ball = { x: 100, y: 20 };
    const head = headPose(line({ x: 100, y: 140 }, { x: 100, y: 30 }), { ball, size: 2 });

    expect(Math.abs(head.angle)).toBeLessThan(0.9);
    expect(head.angle).toBeLessThan(0);
    expect(
      headPose(line({ x: 0, y: 60 }, { x: 60, y: 60 }), { ball: { x: 70, y: 60 }, size: 2 }).angle,
    ).toBeCloseTo(0, 6);
  });

  it('has its nape behind its jaws, away from where it faces', () => {
    for (const facing of [1, -1]) {
      const head = headPose(line({ x: 0, y: 60 }, { x: 60, y: 60 }), {
        ball: { x: 70, y: 60 },
        size: 2,
        facing,
      });

      expect(Math.sign(head.nape.x - head.x)).toBe(-facing);
      expect(head.nape).toEqual(headPoint(head, NAPE));
    }
  });

  it('bends the neck in to the nape and lays no body under the jaws', () => {
    const ball = { x: 100, y: 60 };
    const points = line({ x: 0, y: 60 }, { x: 96, y: 60 }, 20);
    const head = headPose(points, { ball, size: 2 });
    const neck = joinedNeck(points, { head, ball });
    const reach = Math.hypot(head.nape.x - ball.x, head.nape.y - ball.y);

    expect(neck.at(-1)).toMatchObject(head.nape);
    expect(neck.at(-1).radius).toBe(points.at(-1).radius);
    neck
      .slice(0, -1)
      .forEach((at) =>
        expect(Math.hypot(at.x - ball.x, at.y - ball.y)).toBeGreaterThan(reach * 0.75),
      );
  });
});

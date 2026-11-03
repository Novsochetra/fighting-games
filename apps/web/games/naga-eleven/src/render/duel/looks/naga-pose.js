import { headPoint, jawsOffset, NAPE } from './naga-head.js';

// how far the head lifts its snout above level, and dips it below: a head turned on end as the
// ball climbs steeply reads as nothing, so it stays in profile
const LIFT = { most: 0.65, least: -0.45 };

export const levelled = (angle) => -Math.min(LIFT.most, Math.max(LIFT.least, -angle));

// a head further back in a fan is a step darker all over, its eyes still burning, so the heads
// in front stand off it
const darker = (ramp) => ramp && [ramp[0], ...ramp.slice(0, -1)];

export const farther = (art) => ({
  ...art,
  body: darker(art.body),
  accent: darker(art.accent),
  ...(art.hood ? { hood: darker(art.hood) } : {}),
});

// the side the Naga swims to overall, from its tail to the ball, which it faces the whole way
export const facingOf = (points, ball) => (ball.x < points[0].x ? -1 : 1);

// the head in profile with the ball in its jaws, the snout lifted the way the neck climbs to the
// ball; its nape is where the body joins it
export function headPose(points, { ball, size, facing = facingOf(points, ball) }) {
  const from = points.at(-3) ?? points[0];
  const climb = Math.atan2(from.y - ball.y, Math.abs(ball.x - from.x) || 0.001);
  const angle = levelled(-climb) * facing;
  const jaws = jawsOffset({ size, facing, angle });
  const place = { x: ball.x - jaws.x, y: ball.y - jaws.y, size, facing, angle };

  return { ...place, nape: headPoint(place, NAPE) };
}

// the body bent in, where it comes nearer the ball than the back of the head, to the nape, so the
// head sits on its neck and no body runs on under its jaws
export function joinedNeck(points, { head, ball }) {
  const near = Math.hypot(head.nape.x - ball.x, head.nape.y - ball.y);
  const bent = points.map((at) => {
    const pull = Math.max(0, 1 - Math.hypot(at.x - ball.x, at.y - ball.y) / near) ** 0.6;

    return { ...at, x: at.x + (head.nape.x - at.x) * pull, y: at.y + (head.nape.y - at.y) * pull };
  });

  return [...bent, { ...points.at(-1), x: head.nape.x, y: head.nape.y }];
}

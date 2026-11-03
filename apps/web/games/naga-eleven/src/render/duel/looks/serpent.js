import { drawNagaBody } from './naga-body.js';
import { drawNagaHead } from './naga-head.js';
import { facingOf, headPose, joinedNeck } from './naga-pose.js';

const angleOf = (from, to) => Math.atan2(to.y - from.y, to.x - from.x);

const sizedBody = (points, thickness) =>
  points.map((at, i) => ({ ...at, radius: (1.6 + (i / points.length) * 4.4) * thickness }));

// a body of scales from its tail to its neck, thickening toward the head; given the ball in the
// head's jaws, the neck turns in to the back of the head
export function drawSerpentBody(pen, { points, art, thickness = 1, ball, size = 1.2 }) {
  const sized = sizedBody(points, thickness);
  const facing = facingOf(points, ball ?? points.at(-1));
  const head = ball && headPose(points, { ball, size, facing });

  drawNagaBody(pen, { points: head ? joinedNeck(sized, { head, ball }) : sized, art, facing });
}

// the head at the end of the body, jaws round the ball
export function drawSerpentHead(pen, { points, art, ball, size = 1.2 }) {
  drawNagaHead(pen, { ...headPose(points, { ball, size }), art });
}

export function drawSerpent(pen, { points, art, ball, size = 1.2, thickness = 1 }) {
  drawSerpentBody(pen, { points, art, thickness, ball, size });
  drawSerpentHead(pen, { points, art, ball, size });
}

// the trail the ball left, swinging from side to side like a snake swims
export function slither(scene, { count, spacing, sway, phase = 0 }) {
  return Array.from({ length: count }, (_, i) => {
    const back = (count - i) * spacing;
    const at = scene.trailPoint(back);
    const ahead = scene.trailPoint(Math.max(0, back - spacing));
    const angle = angleOf(at, ahead) + Math.PI / 2;
    const swing = Math.sin(i * 0.7 + scene.tick * 0.25 + phase) * sway * (i / count);

    return { x: at.x + Math.cos(angle) * swing, y: at.y + Math.sin(angle) * swing };
  });
}

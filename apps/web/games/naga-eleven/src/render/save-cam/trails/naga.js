import { LOOK_ART } from '../../../art/duel/looks.js';
import { drawNagaBody } from '../../duel/looks/naga-body.js';
import { drawNagaHead } from '../../duel/looks/naga-head.js';
import { facingOf, headPose, joinedNeck } from '../../duel/looks/naga-pose.js';
import { drawWindArc } from '../../duel/looks/wind.js';
import { swayed } from './path.js';

export const crested = (art) => ({ ...art, accent: LOOK_ART.naga.accent });

// the head is as big as holds the ball in its open jaws, but no bigger than the view can bear as
// the ball leaves the foot
export const headSize = (radius) => Math.min(4, Math.max(0.9, radius / 2.9));

// the tail tapers, as a body as thick near the camera as perspective makes it reads as a log;
// `bite` moves where the jaws close off the ball, in head sizes
export function serpentPose(options) {
  const { points, tick, phase = 0, size, bite = [0, 0], turned = false } = options;
  const ball = points.at(-1);
  const body = swayed(points, { amount: 1.2, tick, phase })
    .slice(0, -1)
    .map((at, i, all) => ({ ...at, radius: at.radius * (0.5 + (0.6 * (i + 1)) / all.length) }));
  const facing = facingOf(points, ball) * (turned ? -1 : 1);
  const headSized = size ?? headSize(ball.radius);
  const jaws = { x: ball.x + bite[0] * headSized * facing, y: ball.y + bite[1] * headSized };
  const head = headPose(body.length > 0 ? body : [ball], { ball: jaws, size: headSized, facing });

  return { body, head, jaws, facing };
}

export function serpent(pen, options, pose = serpentPose(options)) {
  const { body, head, jaws, facing } = pose;

  if (body.length > 0) {
    drawNagaBody(pen, { points: joinedNeck(body, { head, ball: jaws }), art: options.art, facing });
  }

  drawNagaHead(pen, { ...head, art: options.headArt ?? crested(options.art) });
}

export function coils(pen, options) {
  serpent(pen, options);
}

// Rithy's sapphire naga winds about Sochetra's jade one, its head turned to his, their jaws
// closing on the one ball from either side like the paired naga of a temple's gable
export function twinCoils(pen, options) {
  const partner = { ...options.art, body: options.art.accent };
  const size = headSize(options.points.at(-1).radius) * 0.85;

  serpent(pen, { ...options, art: partner, phase: Math.PI, size, bite: [-3.4, 0.6], turned: true });
  serpent(pen, { ...options, size, bite: [-3.4, -0.6] });
}

// Hanuman's white wind wound round the Naga's coils
export function windCoils(pen, options) {
  serpent(pen, options);
  options.points.forEach((at, i) => {
    if (i % 4 === 0) {
      drawWindArc(pen, {
        ...at,
        radius: at.radius * 2.4,
        turn: options.tick * 0.3 + i,
        color: options.art.accent[3],
        edge: options.art.accent[1],
      });
    }
  });
}

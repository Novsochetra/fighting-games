import { drawNagaBody } from '../../duel/looks/naga-body.js';
import { headPoint, NAPE } from '../../duel/looks/naga-head.js';
import { farther } from '../../duel/looks/naga-pose.js';
import { titled } from '../../duel/looks/seven-naga.js';
import { drawHeadStamp } from './head-stamps.js';
import { serpent, serpentPose } from './naga.js';
import { drawOnSheet } from './sheet.js';

// the six heads behind the one with the ball stand in an arc over it like the great Naga's on the
// title, the middle ones highest, all looking the way it goes: `turn` is how far round from
// straight up each stands, in degrees, `size` its share of the front head's and `lift` how far it
// raises its snout
const ARC = [3, -3, 2, -2, 1, -1].map((step) => ({
  step,
  turn: [0, 17, 45, 76][Math.abs(step)] * Math.sign(step),
  size: [1, 0.52, 0.47, 0.42][Math.abs(step)],
  lift: [0, 0.35, 0.25, 0.12][Math.abs(step)],
}));

// in the front head's sizes: how far the arc reaches across and up from the middle of its skull
const REACH = { across: 22, up: 19.5 };

// a head's middle, hood and snout together, from the point it is placed by, in its own sizes
const MIDDLE = [3.5, -3.5];

// a neck rises from where the seven part, under the front head, then bends out to its head
function neck(root, nape, size) {
  const bend = { x: root.x + (nape.x - root.x) * 0.2, y: nape.y + (root.y - nape.y) * 0.25 };

  return [0.35, 0.68, 1].map((share) => {
    const keep = 1 - share;

    return {
      x: keep * keep * root.x + 2 * keep * share * bend.x + share * share * nape.x,
      y: keep * keep * root.y + 2 * keep * share * bend.y + share * share * nape.y,
      radius: size * (2.2 - share * 0.5),
    };
  });
}

// where one of the six stands: its middle on the arc over the front head, looking out and up
function placeOf(front, { step, turn, size, lift }) {
  const angle = (turn * Math.PI) / 180;
  const { facing } = front;
  const centre = { x: front.x + front.facing * 3 * front.size, y: front.y - 2 * front.size };
  const spot = {
    x: centre.x + Math.sin(angle) * REACH.across * front.size,
    y: centre.y - Math.cos(angle) * REACH.up * front.size,
  };
  const place = { size: front.size * size, facing, angle: -lift * facing };
  const middle = headPoint(place, MIDDLE);

  return { ...place, step, x: spot.x - middle.x, y: spot.y - middle.y };
}

// the outer ones first, so the inner ones lie over them; of a pair, the one the heads look toward
// goes first, so the snout of the other lies over its hood
const ahead = (arc, facing) =>
  [...arc].sort(
    (first, second) =>
      Math.abs(second.step) - Math.abs(first.step) || (second.step - first.step) * facing,
  );

// the front head with the ball in its jaws, where the six behind it stand in the order they are
// drawn, and where their necks part under it
export function fanOf(options) {
  const ball = options.points.at(-1);
  const front = {
    ...options,
    size: Math.min(4, Math.max(0.78, ball.radius / 3.1)),
    headArt: titled(options.art),
  };
  const pose = serpentPose(front);
  const root = { x: pose.head.nape.x, y: pose.head.nape.y + 3 * pose.head.size };

  return {
    front,
    pose,
    root,
    heads: ahead(ARC, pose.facing).map((head) => placeOf(pose.head, head)),
  };
}

const onPixels = (place) => ({ ...place, x: Math.round(place.x), y: Math.round(place.y) });

function fan(pen, options) {
  const { front, pose, root, heads: places } = fanOf(options);
  const art = farther(titled(options.art));
  const neckArt = farther(options.art);

  places.map(onPixels).forEach((place) => {
    drawNagaBody(pen, {
      points: neck(root, headPoint(place, NAPE), place.size),
      art: neckArt,
      facing: place.facing,
    });
    drawHeadStamp(pen, { ...place, art, far: true }, options.art);
  });
  serpent(pen, front, pose);
}

// the seven heads of the Naga: six on necks parting from its body, fanned over the one in front,
// which holds the ball in its jaws
export function heads(pen, options) {
  drawOnSheet(pen, (sheet) => fan(sheet, options));
}

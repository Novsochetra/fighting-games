import { describe, expect, it } from 'vitest';
import { arrangeView } from '../../../../../packages/screen/src/stage-fit.js';
import { outlineOf } from '../../../../../packages/touch-pad/src/pad-room.js';
import { customStickPlace } from '../../../../../packages/touch-pad/src/stick-place.js';
import { VIEW, WORLD_VIEW } from '../../../src/config.js';
import { FORMATS } from '../../../src/data/formats.js';
import { PITCH_SIDE } from '../../../src/data/skins/pitch-side.js';
import { createCamera, project } from '../../../src/render/camera.js';
import { clampAlong } from '../../../src/render/camera/bounds.js';
import { fixtureMatch } from '../../integration/render/actors/match-fixture.js';

// On a phone held sideways (812 x 375) RUN stood over the right goal mouth, SHOOT over its goal
// line and the stick over half the left penalty box, as the camera came to the end of its rail.
// The keys now keep to the side bars and the lower corners, clear of both goals and boxes.
const PHONES = [
  { width: 667, height: 375, safe: [0, 0, 0, 0] },
  { width: 812, height: 375, safe: [0, 44, 21, 44] },
  { width: 812, height: 335, safe: [0, 44, 0, 44] },
  { width: 844, height: 390, safe: [0, 47, 21, 47] },
  { width: 852, height: 393, safe: [0, 59, 21, 59] },
  { width: 932, height: 430, safe: [0, 59, 21, 59] },
  { width: 780, height: 360, safe: [0, 0, 0, 0] },
  { width: 915, height: 412, safe: [0, 0, 0, 0] },
];

const DEPTHS = [0, 0.25, 0.5, 0.75, 1];
// px between two keys for a thumb to press one and not the next
const THUMB_GAP = 12;

// the keys in CSS px: round keys inside the safe area, the stick's base where it rests
function keysOn({ width, height, safe: [top, right, bottom, left] }) {
  const layer = { left, top, width: width - left - right, height: height - top - bottom };
  const { items } = PITCH_SIDE.layouts.landscape;
  const keys = items
    .filter((item) => item.kind === 'button' && item.id !== 'pause')
    .map((item) => {
      const { box, radius } = outlineOf(item, layer, 1);

      return { id: item.id, x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2, radius };
    });
  const stick = items.find((item) => item.kind === 'stick');
  const radius = (stick.size ?? 128) / 2;
  const { zone, rest } = customStickPlace({ stick: stick.at, layer: { width, height }, radius });

  return [...keys, { id: 'stick', x: zone.left + rest.x, y: rest.y, radius }];
}

function stageOf({ width, height, safe: [top, right, bottom, left] }) {
  const safeArea = { top, right, bottom, left };
  const arranged = { width, height, safe: safeArea, hinge: null, view: VIEW, frame: null };

  return arrangeView({ ...arranged, controlsHeight: 250 }).rect;
}

function cameraAt(match, end, share) {
  const camera = createCamera(match);
  const { minY, maxY } = camera.bounds;

  camera.along.value = clampAlong(camera.bounds, camera.lens, { x: end });
  camera.depth.value = minY + (maxY - minY) * share;

  return camera;
}

// what must stay in sight at a goal line, as outlines on the screen: the penalty box and the six
// yard box as quads on the ground, the goal as the box round every corner of its frame and net
function goalShapes(match, { camera, stage, side }) {
  const { pitch, goal } = match;
  const { box, goalArea } = FORMATS[match.format];
  const line = side < 0 ? 0 : pitch.length;
  const scale = stage.width / WORLD_VIEW.width;
  const toScreen = (x, y, lift = 0) => {
    const point = project(camera, x, y, lift);

    return { x: stage.x + point.x * scale, y: stage.y + point.y * scale };
  };
  const across = (half) => [pitch.width / 2 - half, pitch.width / 2 + half];
  const groundQuad = ({ depth, width }) => {
    const [far, near] = across(width / 2);
    const front = line - side * depth;

    return [toScreen(line, far), toScreen(line, near), toScreen(front, near), toScreen(front, far)];
  };
  const goalPoints = across(goal.width / 2).flatMap((y) =>
    [line, line + side * goal.depth].flatMap((x) => [toScreen(x, y), toScreen(x, y, goal.height)]),
  );

  return { box: groundQuad(box), goalArea: groundQuad(goalArea), goal: boxRound(goalPoints) };
}

const distanceToSegment = (point, from, to) => {
  const along = { x: to.x - from.x, y: to.y - from.y };
  const length = along.x ** 2 + along.y ** 2;
  const share = Math.max(
    0,
    Math.min(1, ((point.x - from.x) * along.x + (point.y - from.y) * along.y) / length),
  );

  return Math.hypot(point.x - (from.x + share * along.x), point.y - (from.y + share * along.y));
};

// a convex outline, its points in order round it, meets a key that reaches over an edge or stands
// inside it
function meets(key, outline) {
  const edges = outline.map((point, i) => [point, outline[(i + 1) % outline.length]]);
  const turns = edges.map(
    ([from, to]) => (to.x - from.x) * (key.y - from.y) - (to.y - from.y) * (key.x - from.x),
  );
  const inside = turns.every((turn) => turn >= 0) || turns.every((turn) => turn <= 0);

  return inside || edges.some(([from, to]) => distanceToSegment(key, from, to) < key.radius);
}

function boxRound(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const [left, right] = [Math.min(...xs), Math.max(...xs)];
  const [top, bottom] = [Math.min(...ys), Math.max(...ys)];

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}

// every shape at both goal lines, the camera at both ends of its rail looking near and far
function shapesSeen(phone, format) {
  const match = fixtureMatch({ format });
  const stage = stageOf(phone);
  const ends = [
    [-Infinity, -1],
    [Infinity, 1],
  ];

  return ends.flatMap(([end, side]) =>
    DEPTHS.map((share) => ({
      where: `the ${side < 0 ? 'left' : 'right'} end, looking ${share} of the way near`,
      ...goalShapes(match, { camera: cameraAt(match, end, share), stage, side }),
    })),
  );
}

function expectClear(keys, seen, parts) {
  for (const shapes of seen) {
    for (const key of keys) {
      for (const part of parts) {
        expect(meets(key, shapes[part]), `${key.id} over the ${part} at ${shapes.where}`).toBe(
          false,
        );
      }
    }
  }
}

const SIDE_BARRED = PHONES.filter((phone) => stageOf(phone).x >= 40);

describe.each(SIDE_BARRED)('the touch keys on a $width x $height phone held sideways', (phone) => {
  const keys = keysOn(phone);

  it.each(['11', '7'])('stand clear of both penalty boxes and goals, %s a side', (format) => {
    expectClear(keys, shapesSeen(phone, format), ['box', 'goalArea', 'goal']);
  });

  it('keeps every key a thumb’s size, a thumb’s gap from the next', () => {
    for (const key of keys) {
      expect(key.radius * 2).toBeGreaterThanOrEqual(44);

      for (const other of keys.filter((next) => next !== key)) {
        const gap = Math.hypot(key.x - other.x, key.y - other.y) - key.radius - other.radius;

        expect(gap, `${key.id} to ${other.id}`).toBeGreaterThanOrEqual(THUMB_GAP);
      }
    }
  });
});

// a 16:9 phone has no side bars: the kicks still stand clear, but the stick's glass base, resting
// in the corner, lies over the near corner of a penalty box the camera sees from afar
describe('the touch keys on a 667 x 375 phone held sideways, which has no side bars', () => {
  const phone = PHONES[0];
  const keys = keysOn(phone);

  it.each(['11', '7'])(
    'keep every goal mouth clear, and the kicks every box, %s a side',
    (format) => {
      const seen = shapesSeen(phone, format);

      expectClear(keys, seen, ['goalArea', 'goal']);
      expectClear(
        keys.filter((key) => key.id !== 'stick'),
        seen,
        ['box'],
      );
    },
  );
});

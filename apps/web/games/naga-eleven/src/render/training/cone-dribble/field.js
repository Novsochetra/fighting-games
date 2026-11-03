import { CHALK, GRASS, SPOT, TRACK } from '../../../art/training/ground.js';
import { LANE } from '../../../training/cone-dribble/course.js';
import { ART_VIEW, dither, faded, noise, oval, paint, pulse } from '../pixels.js';
import { FIELD, rowShift, toScreen } from './view.js';

const STRIPE = 48;

// how far to the side of its cone a spot is chalked, in world units: a far spot stands back past
// the cone's tip, as the cone stands in front of it and would hide it closer in
const PASS_SIDE = { near: 17, far: 31 };

const LANE_ROWS = {
  top: FIELD.laneTop,
  bottom: FIELD.laneTop + Math.round(LANE.width * FIELD.depth),
};

// mown stripes, leaning with the ground, a row at a time; off the lane the grass is left longer
// and darker, so the lane reads at a glance
function drawStripes(context, camera) {
  for (let row = FIELD.top; row < ART_VIEW.height; row += 1) {
    const onLane = row >= LANE_ROWS.top && row <= LANE_ROWS.bottom;
    const colors = onLane ? GRASS.stripe : GRASS.off;
    const offset = Math.round(camera - rowShift(row));
    const first = -(((offset % (STRIPE * 2)) + STRIPE * 2) % (STRIPE * 2));

    paint(context, colors[0], [0, row, ART_VIEW.width, 1]);
    context.fillStyle = colors[1];

    for (let x = first; x < ART_VIEW.width; x += STRIPE * 2) {
      context.fillRect(x, row, STRIPE, 1);
    }
  }

  dither(context, GRASS.off[0], [0, LANE_ROWS.top - 3, ART_VIEW.width, 2]);
  dither(context, GRASS.off[0], [0, LANE_ROWS.bottom + 2, ART_VIEW.width, 2], 1);
}

// the school's clay running track along the wall, its lanes chalked
const TRACK_ROWS = { top: FIELD.top + 3, bottom: FIELD.top + 17 };

function drawTrack(context) {
  const { top, bottom } = TRACK_ROWS;

  paint(context, TRACK.clay, [0, top, ART_VIEW.width, bottom - top]);
  paint(context, TRACK.light, [0, top, ART_VIEW.width, 1]);
  paint(context, TRACK.shade, [0, bottom - 1, ART_VIEW.width, 1]);
  paint(context, TRACK.line, [0, top + 4, ART_VIEW.width, 1]);
  paint(context, TRACK.line, [0, top + 9, ART_VIEW.width, 1]);
  dither(context, TRACK.shade, [0, bottom, ART_VIEW.width, 2]);
}

// the near edge: long tufts the camera looks over
function drawTufts(context, camera) {
  const first = Math.floor(camera / 6);

  for (let i = first; i < first + ART_VIEW.width / 6 + 2; i += 1) {
    const height = 2 + Math.floor(noise(i * 5) * 4);
    const x = i * 6 - camera;

    paint(context, GRASS.tuft, [x, ART_VIEW.height - height, 2, height]);
    paint(context, GRASS.dark, [x + 3, ART_VIEW.height - height + 1, 1, height - 1]);
  }
}

// a few blades of light and shade, fixed to the ground as it scrolls
function drawBlades(context, camera) {
  const cell = 10;
  const first = Math.floor(camera / cell);

  for (let column = first - 4; column < first + ART_VIEW.width / cell + 4; column += 1) {
    for (let row = 0; row < 13; row += 1) {
      const seed = column * 31 + row * 7;
      const y = FIELD.top + 2 + row * 10 + Math.floor(noise(seed) * 8);
      const x = column * cell + Math.floor(noise(seed + 1) * cell) - camera + rowShift(y);

      paint(context, noise(seed + 2) < 0.5 ? GRASS.blade : GRASS.dark, [x, y, 1, 2]);
    }
  }
}

function drawLaneLine(context, camera, y) {
  const from = toScreen(camera, camera - 80, y);
  const to = toScreen(camera, camera + ART_VIEW.width + 80, y);

  paint(context, CHALK.line, [from.x, from.y, to.x - from.x, 1]);
  paint(context, CHALK.shade, [from.x, from.y + 1, to.x - from.x, 1]);
}

function drawCrossLine(context, camera, x) {
  for (let y = 0; y < LANE.width; y += 2) {
    const point = toScreen(camera, x, y);

    paint(context, CHALK.line, [point.x, point.y, 2, 1]);
  }
}

// the next spot glows and points the way on; the rest are chalked, fainter further on
function drawNextSpot(context, point, tick) {
  const glow = 3 + Math.round(pulse(tick, 40) * 2);
  const nudge = Math.floor(tick / 10) % 3;

  oval(context, SPOT.ring, { x: point.x, y: point.y, radiusX: glow + 2, radiusY: 2 });
  oval(context, SPOT.next, { x: point.x, y: point.y, radiusX: glow + 1, radiusY: 1 });

  for (let i = 0; i < 3; i += 1) {
    paint(context, SPOT.next, [point.x + 9 + nudge + i, point.y - 2 + i, 1, 5 - i * 2]);
  }
}

// where a cone's chalk spot is on the screen, on the side it is to be passed
export function spotOf(camera, cone) {
  const side = cone.side === 'far' ? -PASS_SIDE.far : PASS_SIDE.near;

  return toScreen(camera, cone.x, cone.y + side);
}

function drawSpots(context, camera, { cones, tick }) {
  const open = cones.filter((cone) => !cone.passed && cone.down === null);

  open.forEach((cone, i) => {
    const point = spotOf(camera, cone);

    if (i === 0) {
      drawNextSpot(context, point, tick);

      return;
    }

    faded(context, i < 4 ? 1 : 0.5, () => {
      oval(context, CHALK.shade, { x: point.x, y: point.y + 1, radiusX: 3, radiusY: 1 });
      oval(context, SPOT.far, { x: point.x, y: point.y, radiusX: 3, radiusY: 1 });
    });
  });
}

export function drawField(context, { camera, course, tick }) {
  drawStripes(context, camera);
  drawBlades(context, camera);
  paint(context, GRASS.deep, [0, FIELD.top, ART_VIEW.width, 2]);
  dither(context, GRASS.deep, [0, FIELD.top + 2, ART_VIEW.width, 2]);
  drawTrack(context);
  drawLaneLine(context, camera, 0);
  drawLaneLine(context, camera, LANE.width);
  drawCrossLine(context, camera, LANE.start + 10);
  drawCrossLine(context, camera, course.finishX);
  drawSpots(context, camera, { cones: course.cones, tick });
  drawTufts(context, camera);
}

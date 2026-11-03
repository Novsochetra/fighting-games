import { hash } from '../../duel/hash.js';
import { ART, INNER } from '../../duel/layout.js';
import { disc } from '../../duel/shapes.js';
import { DEPTH, FRAME, project } from '../view.js';

// a big stadium by night, drawn each frame: the floodlit stand behind the goal, the boards and the
// grass; `art` is the stadium's own night (SAVE_CAM_ART for the World Stadium's)
const STAND = { top: 26, bottom: 92 };
const BOARDS = { top: 92, bottom: 99 };

// the night over the stand, lighter toward the floodlights in dithered steps, not a smooth fade
function sky(pen, { tick, art }) {
  const [deep, mid] = art.sky;

  pen.rect([0, INNER.top, ART.width, STAND.top - INNER.top + 4], deep);

  for (const lampX of [22, 234]) {
    disc(pen, { x: lampX, y: INNER.top + 2, radius: 18, color: mid });
    disc(pen, { x: lampX, y: INNER.top + 2, radius: 10, color: art.glow[0] });

    for (let i = 0; i < 4; i += 1) {
      pen.rect(
        [lampX - 7 + i * 4, INNER.top, 3, 2],
        hash(i, Math.floor(tick / 20), 201) < 0.9 ? art.lamp[0] : art.lamp[1],
      );
    }
  }
}

// the people of each row of the stand, worked out once a stand: where each sits and the colour of
// his shirt, the rows higher up too dark to tell; the last row runs on under the boards, or the
// match under the cam shows through between them
const ROW_COUNT = Math.ceil((STAND.bottom - STAND.top) / 4);
const rowsKept = new WeakMap();

const rowsOf = (art) =>
  Array.from({ length: ROW_COUNT }, (_, row) => ({
    y: STAND.top + row * 4,
    shade: art.stand[Math.min(3, Math.floor((row / ROW_COUNT) * 4))],
    fans: [...Array(ART.width / 4).keys()]
      .map((i) => ({ x: i * 4 + (row % 2) * 2, seed: hash(i, row, 202) }))
      .filter((fan) => fan.seed < 0.35 && row >= ROW_COUNT / 3)
      .map((fan) => ({
        x: fan.x,
        colour: art.crowd[Math.floor(fan.seed * 20) % art.crowd.length],
      })),
  }));

function standRows(art) {
  if (!rowsKept.has(art)) {
    rowsKept.set(art, rowsOf(art));
  }

  return rowsKept.get(art);
}

// rows of people up the stand: a band of heads, the shirts in the crowd's colours, now and then
// one standing up, a camera flashing here and there
function crowd(pen, { tick, art }) {
  standRows(art).forEach((row, index) => {
    pen.rect([0, row.y, ART.width, 4], row.shade);
    pen.rect([0, row.y + 1, ART.width, 1], art.stand[3]);

    row.fans.forEach((fan, i) => {
      const up = hash(i, index, Math.floor(tick / 7), 203) < 0.08 ? 1 : 0;

      pen.rect([fan.x, row.y + 2 - up, 2, 2], fan.colour);
    });

    if (hash(index, Math.floor(tick / 3), 204) < 0.12) {
      pen.rect([Math.floor(hash(index, tick, 205) * ART.width), row.y, 2, 2], art.flashBulb);
    }
  });
}

// the boards along the foot of the stand, a pattern of the arcade's own, no maker's name
function boards(pen, { art }) {
  const [deep, mid, red, gold, white] = art.boards;

  pen.rect([0, BOARDS.top, ART.width, BOARDS.bottom - BOARDS.top], deep);
  pen.rect([0, BOARDS.top, ART.width, 1], mid);

  for (let x = 4; x < ART.width; x += 32) {
    pen.rect([x, BOARDS.top + 2, 10, 3], red);
    pen.rect([x + 12, BOARDS.top + 2, 2, 3], gold);
    pen.rect([x + 16, BOARDS.top + 3, 9, 1], white);
  }
}

// the grass in mown bands across the view, wider as they come nearer, the goal line and the
// six-yard line white on it
function grass(pen, { art }) {
  const [deep, dark, mid, light] = art.grass;
  const bands = [DEPTH.net + 2, DEPTH.line, 9, 7, 5.2, 3].map((depth) =>
    Math.round(project({ x: 0, y: 0, z: depth }).y),
  );

  pen.rect([0, BOARDS.bottom, ART.width, INNER.bottom - BOARDS.bottom], deep);
  bands.slice(1).forEach((y, i) => {
    pen.rect([0, bands[i], ART.width, y - bands[i]], [dark, mid, dark, light, mid][i]);
  });
  pen.rect([0, FRAME.line, ART.width, 1], art.line[1]);
  pen.rect([0, FRAME.line + 1, ART.width, 1], art.line[0]);

  const six = Math.round(project({ x: 0, y: 0, z: DEPTH.line - 5.5 }).y);

  pen.rect([0, six, ART.width, 2], art.line[1]);
  pen.rect([0, six + 2, ART.width, 1], art.line[0]);
}

export function drawNightStand(pen, { tick, art }) {
  const job = { tick, art };

  sky(pen, job);
  crowd(pen, job);
  boards(pen, job);
  grass(pen, job);
}

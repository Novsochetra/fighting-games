import { hash } from '../../../../../../src/render/duel/hash.js';
import { SHOT_ART } from '../../colors.js';
import { VIEW } from '../../world.js';
import { BOARDS, layerPen } from './layers.js';
import { CROWD_RAMPS } from './palette.js';

const { gold, emerald } = SHOT_ART;
const { led } = SHOT_ART.stadium;

const PANEL = 64;

const SPAN = { from: 32 };

const FACE = { top: BOARDS.top + 2, height: 7 };

// no maker's name: each board only plays a pattern in the stand's colours
const SCHEMES = [0, 1, 4, 3, 0, 1, 2, 4].map((hue) => CROWD_RAMPS[hue]);

function paintTrim(pen, { from, to }) {
  pen.rect([from, BOARDS.top, to - from, 1], gold[1]);
  pen.rect([from, BOARDS.top + 1, to - from, 1], led.frame);
  pen.rect([from, FACE.top + FACE.height, to - from, 1], led.frame);

  for (let x = from; x < to; x += 4) {
    pen.dot(x, BOARDS.top, gold[2]);
    pen.dot(x + 2, BOARDS.top + 1, gold[0]);
  }
}

function chevrons(pen, { left, colours, scroll }) {
  pen.rect([left, FACE.top, PANEL - 1, FACE.height], colours.back);

  for (let row = 0; row < FACE.height; row += 1) {
    const start = (((-Math.abs(row - 3) - scroll) % 8) + 8) % 8;

    for (let x = start - 8; x < PANEL - 1; x += 8) {
      const from = Math.max(0, x);

      pen.rect([left + from, FACE.top + row, Math.min(PANEL - 1, x + 2) - from, 1], colours.mark);
    }
  }
}

function diamonds(pen, { left, colours, scroll }) {
  pen.rect([left, FACE.top, PANEL - 1, FACE.height], led.back);
  pen.rect([left, FACE.top + 2, PANEL - 1, 3], colours.back);

  for (let x = ((scroll % 12) + 12) % 12; x < PANEL - 3; x += 12) {
    pen.rect([left + x + 1, FACE.top + 1, 1, 5], colours.mark);
    pen.rect([left + x, FACE.top + 2, 3, 3], colours.mark);
    pen.dot(left + x + 1, FACE.top + 3, colours.back);
  }
}

const PATTERNS = [chevrons, diamonds];

function coloursOf(panel, { dusk, frame, cheer }) {
  if (dusk >= 3) {
    return { back: emerald[0], mark: (panel + (frame >> 3)) % 3 ? emerald[1] : gold[1] };
  }

  if (cheer) {
    const ramp = CROWD_RAMPS[(panel + (frame >> 3)) % 2 ? 0 : 3];

    return { back: ramp[1], mark: ramp[3] };
  }

  const ramp = SCHEMES[panel % SCHEMES.length];

  return { back: ramp[Math.max(0, 1 - dusk)], mark: ramp[Math.max(0, 3 - dusk * 2)] };
}

export function drawBoards(context, { camera, dusk, frame, cheer }) {
  const pen = layerPen(context, camera, 'boards');
  const scroll = -(frame >> 1);
  const first = Math.max(0, Math.floor((-pen.origin.x / pen.unit - SPAN.from) / PANEL));
  const last = Math.ceil(((VIEW.width - pen.origin.x) / pen.unit - SPAN.from) / PANEL);

  paintTrim(pen, { from: SPAN.from + first * PANEL, to: SPAN.from + last * PANEL });

  for (let panel = first; panel < last; panel += 1) {
    const left = SPAN.from + panel * PANEL;
    const colours = coloursOf(panel, { dusk, frame, cheer });
    const pattern = PATTERNS[Math.floor(hash(panel, 61) * PATTERNS.length)];

    pen.rect([left + PANEL - 1, FACE.top, 1, FACE.height], led.frame);
    pattern(pen, { left, colours, scroll });
  }
}

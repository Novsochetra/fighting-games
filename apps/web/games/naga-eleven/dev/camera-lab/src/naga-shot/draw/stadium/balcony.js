import { SHOT_ART } from '../../colors.js';
import { CONCRETE, CROWD_RAMPS, crowdTone } from './palette.js';
import { BANNERS, STAND } from './stand-plan.js';

const { gold, emerald, white } = SHOT_ART;

const WIDTH = STAND.right - STAND.left;

// diamonds as on a Khmer silk border
const FRIEZE = ['.A..', 'ABA.', '.A..'];

const RED = CROWD_RAMPS[0];

const BLUE = CROWD_RAMPS[1];

const goldAt = (dusk) => gold[Math.max(0, 2 - Math.ceil(dusk / 2))];

function paintFrieze(pen, { top, dusk }) {
  const ink = { A: goldAt(dusk), B: dusk >= 3 ? gold[0] : gold[3] };

  pen.rect([STAND.left, top, WIDTH, FRIEZE.length], crowdTone(RED, 0 - dusk));

  FRIEZE.forEach((line, row) => {
    for (let x = STAND.left; x < STAND.right; x += 1) {
      const mark = line[(x - STAND.left) % line.length];

      if (mark !== '.') {
        pen.dot(x, top + row, ink[mark]);
      }
    }
  });
}

export function paintBalcony(pen, dusk) {
  const concrete = (step) => CONCRETE[Math.max(0, step - dusk)];
  const top = STAND.balcony;

  pen.rect([STAND.left, top, WIDTH, STAND.lower - top], concrete(2));
  pen.rect([STAND.left, top, WIDTH, 1], concrete(4));
  pen.rect([STAND.left, top + 1, WIDTH, 1], goldAt(dusk + 1));
  paintFrieze(pen, { top: top + 2, dusk });
  pen.rect([STAND.left, top + 5, WIDTH, 1], goldAt(dusk + 1));
  pen.rect([STAND.left, STAND.lower - 1, WIDTH, 1], concrete(0));
}

function paintCambodiaFlag(pen, { x, width, dusk }) {
  const top = STAND.lower;

  pen.rect([x, top, width, 15], crowdTone(BLUE, 2 - dusk));
  pen.rect([x, top + 4, width, 7], crowdTone(RED, 2 - dusk));
  pen.rect([x, top, 1, 15], crowdTone(BLUE, 3 - dusk));
  pen.rect([x, top + 4, 1, 7], crowdTone(RED, 3 - dusk));

  const middle = x + Math.floor(width / 2);
  const towers = dusk >= 3 ? crowdTone(RED, 0) : white;

  pen.rect([middle - 5, top + 9, 11, 1], towers);
  pen.rect([middle - 4, top + 7, 2, 2], towers);
  pen.rect([middle - 1, top + 5, 3, 4], towers);
  pen.rect([middle + 3, top + 7, 2, 2], towers);
  pen.rect([x, top + 14, width, 1], crowdTone(BLUE, 1 - dusk));
}

function paintNagaBanner(pen, { x, width, dusk }) {
  const top = STAND.lower;
  const cloth = emerald[Math.max(0, 2 - dusk)];
  const trim = goldAt(dusk);

  pen.rect([x, top, width, 16], cloth);
  pen.rect([x, top, 1, 16], trim);
  pen.rect([x + width - 1, top, 1, 16], trim);
  pen.rect([x + 2, top + 16, width - 4, 1], cloth);
  pen.rect([x + Math.floor(width / 2) - 1, top + 16, 2, 2], cloth);

  for (let row = 0; row < 14; row += 1) {
    const swing = [0, 1, 2, 3, 2, 1][row % 6];

    pen.rect([x + Math.floor(width / 2) - 3 + swing * 1, top + 1 + row, 3, 1], trim);
  }

  pen.rect([x + Math.floor(width / 2) - 4, top + 1, 6, 3], trim);
  pen.dot(x + Math.floor(width / 2) - 2, top + 2, dusk >= 3 ? gold[0] : SHOT_ART.eye[1]);
}

const BANNER_PAINT = { flag: paintCambodiaFlag, naga: paintNagaBanner };

export function paintBanners(pen, dusk) {
  BANNERS.forEach((banner) => BANNER_PAINT[banner.kind](pen, { ...banner, dusk }));
}

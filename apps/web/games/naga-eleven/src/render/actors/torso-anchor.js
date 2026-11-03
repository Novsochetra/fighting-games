import { STAMP } from './number-stamp.js';

// how far under the first full row of shirt (the shoulders) the number's outline starts: on the
// back between the shoulder blades, on the chest under the collar's point
const DROPS = { back: 2, chest: 3 };
const SHOULDER_WIDTH = 5;
const REACH = { across: 2, up: 1, down: 2 };
// a step off the torso's middle costs this much shirt under the outline, so the number keeps to
// the middle unless the shirt runs out round it
const STEP_COST = 3;

function shoulderRow(cell) {
  for (let y = 0; y < cell.height; y += 1) {
    let count = 0;

    for (let x = 0; x < cell.width; x += 1) {
      count += cell.isShirt(x, y) ? 1 : 0;
    }

    if (count >= SHOULDER_WIDTH) {
      return y;
    }
  }

  return -1;
}

function middleOf(cell, top) {
  let sum = 0;
  let count = 0;

  for (let y = top; y < top + STAMP.height; y += 1) {
    for (let x = 0; x < cell.width; x += 1) {
      if (cell.isShirt(x, y)) {
        sum += x;
        count += 1;
      }
    }
  }

  return count ? sum / count : cell.width / 2;
}

function shirtUnder(cell, { x, y, inset }) {
  let count = 0;

  for (let j = inset; j < STAMP.height - inset; j += 1) {
    for (let i = inset; i < STAMP.width - inset; i += 1) {
      count += cell.isShirt(x + i, y + j) ? 1 : 0;
    }
  }

  return count;
}

const DIGIT_AREA = (STAMP.width - 2) * (STAMP.height - 2);

// where the number's box goes on one frame, its top left in the frame: as near the torso's middle
// as keeps every digit on the shirt, or null where the shirt has no room for them
export function torsoAnchor(cell, side) {
  const shoulders = shoulderRow(cell);

  if (shoulders < 0) {
    return null;
  }

  const top = shoulders + DROPS[side];
  const left = Math.round(middleOf(cell, top) - (STAMP.width - 1) / 2);
  let best = null;

  for (let dy = -REACH.up; dy <= REACH.down; dy += 1) {
    for (let dx = -REACH.across; dx <= REACH.across; dx += 1) {
      const at = { x: left + dx, y: top + dy };
      const score =
        shirtUnder(cell, { ...at, inset: 0 }) - STEP_COST * (Math.abs(dx) + Math.abs(dy));

      if (
        shirtUnder(cell, { ...at, inset: 1 }) === DIGIT_AREA &&
        score > (best?.score ?? -Infinity)
      ) {
        best = { ...at, score };
      }
    }
  }

  return best && { x: best.x, y: best.y };
}

function nearestFound(found, i) {
  for (let step = 1; step < found.length; step += 1) {
    const anchor = found[i - step] ?? found[i + step];

    if (anchor) {
      return anchor;
    }
  }

  return null;
}

// a row's frames together: a frame with no room keeps the place of the nearest that has it, so the
// number stays put as an arm swings over it; a row with room in fewer than half its frames shows
// none, as a number there would blink
export function rowAnchors(cells, side) {
  const found = cells.map((cell) => torsoAnchor(cell, side));
  const count = found.filter(Boolean).length;

  if (count * 2 < found.length) {
    return found.map(() => null);
  }

  return found.map((anchor, i) => anchor ?? nearestFound(found, i));
}

// which pixels of the number's box are shirt on a frame, so what an arm covers is left out
export function maskAt(cell, { x, y }) {
  const mask = new Uint8Array(STAMP.width * STAMP.height);

  for (let j = 0; j < STAMP.height; j += 1) {
    for (let i = 0; i < STAMP.width; i += 1) {
      mask[j * STAMP.width + i] = cell.isShirt(x + i, y + j) ? 1 : 0;
    }
  }

  return mask;
}

// Cards shrink by distance from the center one; past the last scale they are hidden.
export const SLOT_SCALES = [1, 0.8, 0.64, 0.5];
export const SLOT_DIMMING = [1, 0.62, 0.42, 0.42];
export const SLOT_OPACITY = [1, 1, 0.8, 0];
const LAST_SLOT = SLOT_SCALES.length - 1;

// The carousel loops: each card sits on the shorter way round from the selected one.
export function circularOffset(index, selected, count) {
  if (count <= 0) {
    return 0;
  }
  const forward = (((index - selected) % count) + count) % count;
  return forward > count / 2 ? forward - count : forward;
}

// How many card widths a card's center sits from the carousel's center: half of the center card,
// every smaller card in between, and half of its own.
export function centerShift(distance) {
  if (distance <= 0) {
    return 0;
  }
  const between = SLOT_SCALES.slice(1, distance).reduce((sum, scale) => sum + scale, 0);
  return SLOT_SCALES[0] / 2 + between + SLOT_SCALES[distance] / 2;
}

export function slotFor(offset) {
  const distance = Math.min(Math.abs(offset), LAST_SLOT);
  return {
    side: offset < 0 ? -1 : 1,
    distance,
    shift: centerShift(distance),
    scale: SLOT_SCALES[distance],
    dimming: SLOT_DIMMING[distance],
    opacity: SLOT_OPACITY[distance],
    depth: SLOT_SCALES.length - distance,
    isCenter: distance === 0,
    isHidden: SLOT_OPACITY[distance] === 0,
  };
}

// Every card slides as far as the carousel turns, except one that comes round the loop: it enters from
// out of sight beyond its new place, so no card slides across the row, and a copy of it leaves by the
// side it went out, unless it was out of sight already.
export function planTurn(previousOffsets, selected, count) {
  const turn = previousOffsets[selected];
  return Array.from({ length: count }, (_, index) => {
    const offset = circularOffset(index, selected, count);
    const before = previousOffsets[index];
    const wraps = Number.isFinite(turn) && Number.isFinite(before) && before - offset !== turn;
    return {
      offset,
      enterFrom: wraps ? offset + turn : null,
      leaveTo: wraps && !slotFor(before).isHidden ? before - turn : null,
    };
  });
}

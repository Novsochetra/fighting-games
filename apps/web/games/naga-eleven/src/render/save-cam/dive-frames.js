import { DIVE_FRAMES } from '../../art/save-cam/keeper-dive/index.js';

// ticks of the show's clock from the contact: he waits set, pushes off at `push`, is at full stretch
// from `stretch` and holds it past the contact to `hold`, comes down flatter, and lies on the grass
// from `land`
export const DIVE_BEATS = { push: -12, stretch: -6, hold: 10, land: 18 };

// how far a frame's navel is above its lowest pixel, and where its gloves are from its navel
export const restOf = (map) => map.rows.length - 1 - map.anchor.y;

export const handsOf = (map) => ({ x: map.hands.x - map.anchor.x, y: map.hands.y - map.anchor.y });

const glovesOffGrass = (map) => restOf(map) - handsOf(map).y;

// how high off the grass his gloves are at full stretch with his boots on it, on the steep
// diagonal and the shallow one: a ball that high takes it, one lower than both the flat dive
export const DIAGONAL_FROM = glovesOffGrass(DIVE_FRAMES.high.reach);

export const SHALLOW_FROM = glovesOffGrass(DIVE_FRAMES.mid.reach);

export function stretchOf(ballHeight) {
  if (ballHeight >= DIAGONAL_FROM) {
    return 'high';
  }

  return ballHeight >= SHALLOW_FROM ? 'mid' : 'low';
}

// what his gloves do: fists for a punch; open, then round the ball as he catches it; open and
// reaching when it beats him, or when he only gets a touch to it
export function gripOf(outcome, since) {
  if (outcome === 'punch') {
    return 'punch';
  }

  return outcome === 'catch' && since >= 0 ? 'catch' : 'reach';
}

// the frame he is drawn in `since` ticks from the contact, and its name
export function diveFrameAt({ outcome, stretch }, since) {
  if (since < DIVE_BEATS.push) {
    return { name: 'set', map: DIVE_FRAMES.set };
  }

  if (since < DIVE_BEATS.stretch) {
    return { name: 'push', map: DIVE_FRAMES.push[stretch] };
  }

  const grip = gripOf(outcome, since);

  if (since < DIVE_BEATS.hold) {
    return { name: 'stretch', map: DIVE_FRAMES[stretch][grip] };
  }

  if (since < DIVE_BEATS.land) {
    return { name: 'fall', map: DIVE_FRAMES.low[grip] };
  }

  return { name: 'land', map: DIVE_FRAMES.land[grip === 'catch' ? 'ball' : 'empty'] };
}

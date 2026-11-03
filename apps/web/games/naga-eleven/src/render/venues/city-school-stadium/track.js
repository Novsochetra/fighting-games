import { grainOf, toneIndex } from '../ground/grass.js';

// the red running track round the school pitch: a strip of grass, then six lanes with white lines
// between, curving round the corners, then a concrete apron up to the wall
const GRASS_GAP = 12;
const LANE = 8;
const LANES = 6;

// how far a point lies outside the pitch, the corners rounded as a track's bends are
function outsideBy(x, y, { pitch }) {
  const dx = Math.max(0, -x, x - pitch.length);
  const dy = Math.max(0, -y, y - pitch.width);

  return Math.sqrt(dx * dx + dy * dy);
}

export function trackSurface(layout, art, grass) {
  const outer = GRASS_GAP + LANE * LANES;

  return (x, y, column, row) => {
    const away = outsideBy(x, y, layout);

    if (away < GRASS_GAP) {
      return grass(x, y, column, row);
    }

    if (away > outer) {
      return art.concrete[toneIndex(2.6 + grainOf(column, row) * 0.4, column, row, art.concrete)];
    }

    const lane = (away - GRASS_GAP) / LANE;

    if (lane - Math.floor(lane) < 0.13 || away > outer - 1) {
      return art.line[1];
    }

    return art.track[toneIndex(3 + grainOf(column, row) * 0.5, column, row, art.track)];
  };
}

export const TRACK_OUTER = GRASS_GAP + LANE * LANES;

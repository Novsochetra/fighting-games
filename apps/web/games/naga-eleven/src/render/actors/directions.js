// the eight ways a sprite can face, clockwise from facing the camera
export const DIRECTIONS = [
  'south',
  'south-east',
  'east',
  'north-east',
  'north',
  'north-west',
  'west',
  'south-west',
];

// tan(22.5°): past it a facing leans into the next of the eight ways
const SLANT = 0.4142;

// facing is a vector on the pitch, y toward the near touchline and the camera: south
export function directionOf({ x, y }) {
  const across = Math.abs(x);
  const down = Math.abs(y);

  if (across < 1e-6 && down < 1e-6) {
    return 'south';
  }

  if (down <= across * SLANT) {
    return x > 0 ? 'east' : 'west';
  }

  if (across <= down * SLANT) {
    return y > 0 ? 'south' : 'north';
  }

  return `${y > 0 ? 'south' : 'north'}-${x > 0 ? 'east' : 'west'}`;
}

const stepsBetween = (first, second) => {
  const gap = Math.abs(DIRECTIONS.indexOf(first) - DIRECTIONS.indexOf(second));

  return Math.min(gap, DIRECTIONS.length - gap);
};

const mirrorOf = (direction) =>
  direction.replace(/east|west/, (side) => (side === 'east' ? 'west' : 'east'));

function drawnRow(rows, direction) {
  const entry = rows[direction];

  if (typeof entry === 'number') {
    return { row: entry, mirror: false, drawn: direction };
  }

  const source = rows[entry?.mirrorOf];

  return typeof source === 'number' ? { row: source, mirror: true, drawn: entry.mirrorOf } : null;
}

// a way not drawn may still be its mirror image drawn
function candidateFor(rows, direction) {
  const mirrored = drawnRow(rows, mirrorOf(direction));

  return drawnRow(rows, direction) ?? (mirrored && { ...mirrored, mirror: !mirrored.mirror });
}

// an animation drawn for fewer ways stands in with the nearest it has, mirrored if need be;
// `drawn` names the way the row it uses was drawn facing
export function rowFor(rows, direction) {
  const byNearness = [...DIRECTIONS].sort(
    (first, second) => stepsBetween(direction, first) - stepsBetween(direction, second),
  );

  for (const each of byNearness) {
    const candidate = candidateFor(rows, each);

    if (candidate) {
      return candidate;
    }
  }

  return { row: 0, mirror: false, drawn: DIRECTIONS[0] };
}

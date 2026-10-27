const SEGMENT_QUERIES = ['(horizontal-viewport-segments: 2)', '(vertical-viewport-segments: 2)'];
// a segment may round past the screen's edge by a pixel
const SLACK = 1;

const boxOf = ({ x, y, width, height }) => ({ x, y, width, height });

// the page lays out against the size it measures itself, so a segment that is no box on that
// screen is not trusted, and the page lays out as one screen rather than off it
function onScreen({ x, y, width, height }, screen) {
  const inside = (from, length, room) => from >= -SLACK && from + length <= room + SLACK;

  return (
    width > 0 && height > 0 && inside(x, width, screen.width) && inside(y, height, screen.height)
  );
}

// the game takes the top half of a phone folded like a laptop on a table, the touch controls the
// bottom half, or the left half of one folded like a book, so the fold never runs through the fight
export function hingeOf(segments, screen) {
  const [first, second] = [...segments].sort((one, other) => one.y - other.y || one.x - other.x);
  const stacked = second.y >= first.y + first.height;
  const apart = stacked || second.x >= first.x + first.width;

  if (!apart || !segments.every((segment) => onScreen(segment, screen))) {
    return null;
  }

  return { stacked, game: boxOf(first), controls: boxOf(second) };
}

// Chrome reports the two halves of a half-folded phone, or the two screens of a dual-screen one, as
// segments of the viewport; a flat screen is one segment, and Safari and Firefox have no
// window.viewport, so both lay out as one screen
export function readHinge(window, screen) {
  const segments = window.viewport?.segments;

  return segments?.length === 2 ? hingeOf(segments, screen) : null;
}

// folding a phone halfway changes its segments without always changing its size. A browser that
// knows neither posture nor segments never calls back, and Safari before 14 has no addEventListener
// on a media query list
export function onFoldChange(window, callback) {
  window.navigator.devicePosture?.addEventListener('change', callback);
  for (const query of SEGMENT_QUERIES) {
    window.matchMedia?.(query).addEventListener?.('change', callback);
  }
}

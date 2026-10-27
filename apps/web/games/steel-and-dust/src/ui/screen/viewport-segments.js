// Chrome reports the two halves of a half-folded phone, or the two screens of a dual-screen one, as
// segments of the viewport; a flat screen is one segment, and Safari and Firefox have no
// window.viewport, so both lay out as one screen
export function readHinge(window) {
  const segments = window.viewport?.segments;
  return segments?.length === 2 ? hingeOf(segments) : null;
}

const boxOf = ({ x, y, width, height }) => ({ x, y, width, height });

// the game takes the top half of a phone folded like a laptop on a table, the touch controls the
// bottom half, or the left half of one folded like a book, so the fold never runs through the fight
export function hingeOf(segments) {
  const [first, second] = [...segments].sort((one, other) => one.y - other.y || one.x - other.x);

  return {
    stacked: second.y >= first.y + first.height,
    game: boxOf(first),
    controls: boxOf(second),
  };
}

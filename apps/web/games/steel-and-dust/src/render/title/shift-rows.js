// each row of a stretch of the painting drawn again as many pixels aside as `offsetAt(y)` says; it
// samples past the stretch rather than drawing past it, so whatever lies around it never moves
export function shiftRows(context, { painting, area, offsetAt }) {
  const width = area.right - area.left;
  for (let y = area.top; y < area.bottom; y++) {
    const offset = offsetAt(y);
    if (offset !== 0) {
      context.drawImage(painting, area.left - offset, y, width, 1, area.left, y, width, 1);
    }
  }
}

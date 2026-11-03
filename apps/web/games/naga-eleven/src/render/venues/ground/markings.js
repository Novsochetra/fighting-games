// the lines of the pitch as world shapes: lines `along` the pitch (a fixed y), lines `across` it
// (a fixed x), rings (circles and arcs, each kept to its `clip`) and spots
function endMarkings({ pitch, areas, middle }, line, toward) {
  const box = (area) => {
    const front = line + toward * area.depth;
    const [from, to] = [Math.min(line, front), Math.max(line, front)];

    return {
      across: [{ x: front, from: middle.y - area.width / 2, to: middle.y + area.width / 2 }],
      along: [middle.y - area.width / 2, middle.y + area.width / 2].map((y) => ({ y, from, to })),
    };
  };
  const big = box(areas.box);
  const small = box(areas.goalArea);
  const spot = { x: line + toward * areas.penaltySpot, y: middle.y };
  const boxFront = line + toward * areas.box.depth;
  const arcClip =
    toward > 0 ? { left: boxFront, right: Infinity } : { left: -Infinity, right: boxFront };

  return {
    across: [...big.across, ...small.across],
    along: [...big.along, ...small.along],
    rings: [
      { ...spot, radius: areas.centreCircle, clip: { ...arcClip, top: 0, bottom: pitch.width } },
    ],
    spots: [spot],
  };
}

function cornerArcs({ pitch, areas }) {
  const radius = areas.centreCircle / 9;

  return [0, pitch.length].flatMap((x) =>
    [0, pitch.width].map((y) => ({
      x,
      y,
      radius,
      clip: { left: 0, right: pitch.length, top: 0, bottom: pitch.width },
    })),
  );
}

export function markingsOf(layout) {
  const { pitch, areas, middle } = layout;
  const ends = [endMarkings(layout, 0, 1), endMarkings(layout, pitch.length, -1)];
  const whole = { left: -Infinity, right: Infinity, top: -Infinity, bottom: Infinity };

  return {
    along: [0, pitch.width]
      .map((y) => ({ y, from: 0, to: pitch.length }))
      .concat(ends.flatMap((end) => end.along)),
    across: [0, middle.x, pitch.length]
      .map((x) => ({ x, from: 0, to: pitch.width }))
      .concat(ends.flatMap((end) => end.across)),
    rings: [{ ...middle, radius: areas.centreCircle, clip: whole }, ...cornerArcs(layout)].concat(
      ends.flatMap((end) => end.rings),
    ),
    spots: [middle, ...ends.flatMap((end) => end.spots)],
  };
}

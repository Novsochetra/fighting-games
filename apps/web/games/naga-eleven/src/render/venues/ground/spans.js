// which stretches of world x a row of the ground paints as line, given how thick the lines are:
// `along` thickness in depth and `across` in x, both in world units
const overlaps = (row, from, to) => row.bottom >= from && row.top <= to;

function alongSpans(markings, row, thick) {
  return markings.along
    .filter((line) => overlaps(row, line.y - thick.along / 2, line.y + thick.along / 2))
    .map((line) => [line.from - thick.across / 2, line.to + thick.across / 2]);
}

function acrossSpans(markings, row, thick) {
  return markings.across
    .filter((line) => overlaps(row, line.from - thick.along / 2, line.to + thick.along / 2))
    .map((line) => [line.x - thick.across / 2, line.x + thick.across / 2]);
}

// a row covers a band of depth, so a ring takes its widest chord across that band outside and its
// narrowest inside: a ring drawn row by row then has no gaps where it runs nearly level
function ringSpans(ring, row, half) {
  const nearest =
    ring.y >= row.top && ring.y <= row.bottom
      ? 0
      : Math.min(Math.abs(ring.y - row.top), Math.abs(ring.y - row.bottom));
  const farthest = Math.max(Math.abs(ring.y - row.top), Math.abs(ring.y - row.bottom));
  const outer = ring.radius + half;
  const inner = ring.radius - half;

  if (nearest > outer || row.y < ring.clip.top || row.y > ring.clip.bottom) {
    return [];
  }

  const out = Math.sqrt(outer * outer - nearest * nearest);
  const within = farthest < inner ? Math.sqrt(inner * inner - farthest * farthest) : 0;
  const spans =
    within > 0
      ? [
          [ring.x - out, ring.x - within],
          [ring.x + within, ring.x + out],
        ]
      : [[ring.x - out, ring.x + out]];

  return spans
    .map(([from, to]) => [Math.max(from, ring.clip.left), Math.min(to, ring.clip.right)])
    .filter(([from, to]) => to > from);
}

function spotSpans(markings, row, radius) {
  return markings.spots.flatMap((spot) =>
    ringSpans(
      {
        ...spot,
        radius: radius / 2,
        clip: { left: -Infinity, right: Infinity, top: -Infinity, bottom: Infinity },
      },
      row,
      radius / 2,
    ),
  );
}

export function lineSpans(markings, row, thick) {
  return [
    ...alongSpans(markings, row, thick),
    ...acrossSpans(markings, row, thick),
    ...markings.rings.flatMap((ring) => ringSpans(ring, row, thick.across / 2)),
    ...spotSpans(markings, row, thick.spot),
  ];
}

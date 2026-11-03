import { DUEL_INK } from '../../../art/duel/palette.js';
import { band, disc } from '../shapes.js';

function crossings(points, rowY) {
  const found = [];

  points.forEach(([ax, ay], i) => {
    const [bx, by] = points[(i + 1) % points.length];

    if (ay <= rowY !== by <= rowY) {
      found.push(ax + ((rowY - ay) / (by - ay)) * (bx - ax));
    }
  });

  return found.sort((first, second) => first - second);
}

// a polygon's rows as spans [row, left, right], sampled at the middle of each row as the duel's
// polygons are, worked out once for both its ink and its fill
function spansOf(points) {
  const ys = points.map(([, y]) => y);
  const spans = [];

  for (let row = Math.floor(Math.min(...ys)); row <= Math.ceil(Math.max(...ys)); row += 1) {
    const found = crossings(points, row + 0.5).map(Math.round);

    for (let i = 0; i + 1 < found.length; i += 2) {
      spans.push([row, found[i], found[i + 1]]);
    }
  }

  return spans;
}

// a span's ring of ink, beside it and over and under it; a lit part's ring reaches round the
// darker copy of it a pixel down and right (`rimmed`) too
function inkSpan(pen, [row, left, right], rim) {
  const width = right - left;

  pen.rect([left - 1, row, width + 2, 1], DUEL_INK);
  pen.rect([left, row - 1, width, 1], DUEL_INK);
  pen.rect([left, row + 1, width + (rim ? 2 : 0), 1], DUEL_INK);

  if (rim) {
    pen.rect([left + 1, row + 2, width, 1], DUEL_INK);
  }
}

// a round part is ringed by drawing it once a pixel bigger all round, as a body is hundreds of
// them; one with a darker copy grows half a pixel more toward that copy
function grown(part) {
  const lean = part.rim ? 0.5 : 0;
  const reach = part.rim ? 1.75 : 1;
  const nudge = ({ x, y }) => ({ x: x + lean, y: y + lean });

  if (part.kind === 'disc') {
    return { ...part, ...nudge(part), radius: part.radius + reach };
  }

  return { ...part, from: nudge(part.from), to: nudge(part.to), width: part.width + reach * 2 };
}

const ROUND = {
  disc: (pen, part, color) => disc(pen, { ...part, color }),
  band: (pen, part, color) => band(pen, { ...part, color }),
};

function ink(pen, part) {
  if (part.spans) {
    part.spans.forEach((span) => inkSpan(pen, span, part.rim));
  } else {
    ROUND[part.kind](pen, grown(part), DUEL_INK);
  }
}

function paint(pen, part) {
  if (part.spans) {
    part.spans.forEach(([row, left, right]) => pen.rect([left, row, right - left, 1], part.color));
  } else {
    ROUND[part.kind](pen, part, part.color);
  }
}

// a figure of parts, one line of ink round all those marked `ink`, then each painted in order
export function drawInked(pen, parts) {
  const ready = parts.map((part) =>
    part.kind === 'poly' ? { ...part, spans: spansOf(part.points) } : part,
  );

  ready.filter((part) => part.ink).forEach((part) => ink(pen, part));
  ready.forEach((part) => paint(pen, part));
}

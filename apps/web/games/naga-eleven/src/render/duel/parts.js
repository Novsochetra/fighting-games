import { DUEL_INK } from '../../art/duel/palette.js';
import { shiftedPen } from './pen.js';
import { band, disc, ellipse, polygon } from './shapes.js';

const PAINTERS = {
  poly: (pen, part, color) => polygon(pen, part.points, color),
  ellipse: (pen, part, color) => ellipse(pen, { ...part, color }),
  disc: (pen, part, color) => disc(pen, { ...part, color }),
  band: (pen, part, color) => band(pen, { ...part, color }),
};

const AROUND = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

// a figure made of parts, ringed in one line of ink around all of them, then painted in order
export function drawParts(pen, parts) {
  for (const [dx, dy] of AROUND) {
    const moved = shiftedPen(pen, dx, dy);

    for (const part of parts) {
      if (part.ink !== false) {
        PAINTERS[part.kind](moved, part, DUEL_INK);
      }
    }
  }

  for (const part of parts) {
    PAINTERS[part.kind](pen, part, part.color);
  }
}

// a ball lit from the top left in four steps of its ramp
export function shadedDisc(pen, { x, y, radius, ramp, outline = true }) {
  const steps = [
    { kind: 'disc', x, y, radius, color: ramp[0] },
    {
      kind: 'disc',
      x: x - radius * 0.12,
      y: y - radius * 0.12,
      radius: radius * 0.82,
      color: ramp[1],
      ink: false,
    },
    {
      kind: 'disc',
      x: x - radius * 0.3,
      y: y - radius * 0.3,
      radius: radius * 0.5,
      color: ramp[2],
      ink: false,
    },
    {
      kind: 'disc',
      x: x - radius * 0.45,
      y: y - radius * 0.45,
      radius: radius * 0.2,
      color: ramp[3],
      ink: false,
    },
  ];

  if (outline) {
    drawParts(pen, steps);
  } else {
    steps.forEach((step) => disc(pen, { ...step }));
  }
}

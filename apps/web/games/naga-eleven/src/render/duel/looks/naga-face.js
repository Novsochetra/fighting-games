import { DUEL_INK } from '../../../art/duel/palette.js';
import { poly, strip } from './naga-shape.js';

// the eye narrowed under a heavy brow that slants down toward the snout, which is what makes it
// fierce; its pupil burns bright in a red iris. The lid's shadow is left off a small head, whose
// eye is a row or two of pixels the shadow would put out
export const eye = (point, art, size) => {
  const [px, py] = point(5, -2.6);
  const lid = poly(point, '2.2,-2.3 3.4,-3.1 5.6,-3.3 6.8,-2.9 5.4,-2.6 3.2,-2.5', art.eye[0]);

  return [
    poly(point, '1.4,-2.2 3,-3.6 5.6,-3.9 7.6,-3 5.8,-1.6 3,-1.4', DUEL_INK),
    poly(point, '2.2,-2.3 3.4,-3.1 5.6,-3.3 6.8,-2.9 5.4,-2 3.2,-1.9', art.eye[1]),
    ...(size >= 1.4 ? [lid] : []),
    {
      kind: 'disc',
      x: px,
      y: py,
      radius: Math.max(0.5, size * 0.6),
      color: art.eye[2],
      ink: false,
    },
    poly(point, '0.4,-3.2 3.6,-5 6.4,-4.8 8.6,-3.4 7.6,-3 5.6,-3.9 3,-3.6 1.2,-2.4', DUEL_INK),
    poly(point, '0.8,-3.6 3.6,-5.4 6.4,-5.2 8.6,-3.8 6.4,-4.8 3.6,-5', art.accent[3]),
  ];
};

// a gold lip along the upper jaw, the nostril on the snout, and a curl of the kbach on the cheek;
// what runs along the head's edge is ringed in ink, which the head paints over, so rounding
// leaves none of it bare
export const ornament = (point, art) => [
  strip(point, {
    edge: '1.6,2 4.4,1.2 9,0.2 13.6,-0.4 15.6,-0.8',
    depth: [0, -0.8],
    color: art.accent[2],
    ink: true,
  }),
  poly(point, '13.6,-2.8 14.8,-3 14.6,-2.2', DUEL_INK),
  poly(point, '14.6,-4.4 15.4,-5.2 16.4,-4.8 16.4,-3.8 15.8,-4.4 15.2,-4.4', art.accent[3], true),
  poly(point, '-3.6,0.8 -2,-1.2 0.4,-1.2 1.4,0.4 0,1.6 -0.6,0.2 -1.8,0.4 -2,1.8', art.accent[2]),
  poly(point, '-3,0.6 -2,-0.6 0,-0.6 -0.4,-0.2 -1.8,-0.2 -2.4,1', art.accent[3]),
  ...[6, 9, 12].map((across) =>
    poly(
      point,
      [
        [across, -2.4],
        [across + 1, -2.8],
        [across + 0.6, -1.8],
      ],
      art.body[1],
    ),
  ),
];

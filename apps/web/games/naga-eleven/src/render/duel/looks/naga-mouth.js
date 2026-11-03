import { NAGA_MOUTH } from '../../../art/duel/naga.js';
import { pointsOf } from '../points.js';
import { poly, strip } from './naga-shape.js';

// corners along the roof of the mouth go by the head, those along its floor by the open jaw
const ROOF = '1.6,2 4.4,1.2 9,0.2 12,-0.2';

const FLOOR = '10,4.6 4.4,3.4 0.6,1.8';

const UPPER_FANGS = [
  '13,-0.4 14.6,-0.6 13.6,2.4',
  '9.4,0.1 10.6,0 9.9,1.8',
  '6,0.7 6.9,0.6 6.4,1.8',
];

const LOWER_FANGS = ['11.2,5.5 12.4,5.8 11.8,3.8', '7.6,4.6 8.6,4.9 8.1,3.4'];

const fangs = (point, list) =>
  list.flatMap((corners) => {
    const [root, side, tip] = pointsOf(corners);
    const lit = [root, [(root[0] + side[0]) / 2, (root[1] + side[1]) / 2], tip];

    return [
      poly(point, [root, side, tip], NAGA_MOUTH.fang[0], true),
      poly(point, lit, NAGA_MOUTH.fang[1]),
    ];
  });

// deep in the gape the throat, the tongue forked along the floor of the mouth, and the fangs;
// what stands out into the open gape is ringed in ink, so it reads over any sky
export const mouth = (point, jawPoint) => [
  {
    kind: 'poly',
    points: [
      ...pointsOf(ROOF).map(([across, down]) => point(across, down)),
      ...pointsOf(FLOOR).map(([across, down]) => jawPoint(across, down)),
    ],
    color: NAGA_MOUTH.inside,
    ink: false,
  },
  poly(point, '1.6,2 4.4,1.4 6.4,1.2 5.6,3 0.6,1.8', NAGA_MOUTH.throat),
  strip(point, {
    edge: '1.6,2 4.4,1.2 9,0.2 13.6,-0.4',
    depth: [0, 0.7],
    color: NAGA_MOUTH.tongue[0],
    ink: true,
  }),
  strip(jawPoint, {
    edge: '0.6,1.8 4.4,3.4 9,5 13.2,5.8',
    depth: [0, -0.6],
    color: NAGA_MOUTH.tongue[0],
    ink: true,
  }),
  poly(
    jawPoint,
    '3.4,2.9 9,4.4 12.4,4.6 14.6,3.6 13.4,4.9 15,5.4 12.4,5.3 9,5',
    NAGA_MOUTH.tongue[0],
    true,
  ),
  poly(jawPoint, '4.4,3 9,4.4 12.4,4.6 14.6,3.6 12.4,4.9 9,4.8', NAGA_MOUTH.tongue[1]),
  ...fangs(point, UPPER_FANGS),
  ...fangs(jawPoint, LOWER_FANGS),
];

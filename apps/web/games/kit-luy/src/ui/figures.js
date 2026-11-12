const SVG = 'http://www.w3.org/2000/svg';

// A customer sits facing the stall, so they are drawn from the front, hips on the stool's seat at
// the foot of a 60 by 64 box. Shapes only: the page's styles give each part its ink.
const TORSO = 'M17 64 L19 41 Q20 34 30 34 Q40 34 41 41 L43 64 Z';
const NECK = 'M27 28 h6 v8 h-6 Z';

const kid = (cx, part) =>
  ({
    torso: `M${cx - 9} 64 L${cx - 8} 47 Q${cx - 7} 42 ${cx} 42 Q${cx + 7} 42 ${cx + 8} 47 L${cx + 9} 64 Z`,
    hair: `M${cx - 7.5} 33 Q${cx - 7.5} 24 ${cx} 24 Q${cx + 7.5} 24 ${cx + 7.5} 33 Q${cx} 28 ${cx - 7.5} 33 Z`,
  })[part];

const adult = (shirt) => [
  ['path', { d: TORSO, class: `fig-${shirt}` }],
  ['path', { d: NECK, class: 'fig-skin' }],
  ['circle', { cx: 30, cy: 22, r: 10, class: 'fig-skin' }],
];

const PEOPLE = {
  // a krama wound round her head and tied under it
  shopper: [
    ...adult('red'),
    [
      'path',
      {
        d: 'M19 25 Q18 9 30 9 Q42 9 41 25 Q41 31 37 34 L36 22 Q30 17 24 22 L23 34 Q19 31 19 25 Z',
        class: 'fig-krama',
      },
    ],
  ],
  // a moto driver in his helmet, the visor pushed up
  driver: [
    ...adult('ink'),
    ['path', { d: 'M18 24 Q18 8 30 8 Q42 8 42 24 L42 27 L18 27 Z', class: 'fig-red' }],
    ['rect', { x: 20, y: 17, width: 20, height: 5, rx: 2, class: 'fig-visor' }],
  ],
  // a cook buying for her own stall: an apron and a wide cloth sun hat
  cook: [
    ...adult('blue'),
    ['path', { d: 'M23 45 L37 45 L40 64 L20 64 Z', class: 'fig-paper' }],
    ['ellipse', { cx: 30, cy: 16, rx: 19, ry: 4.5, class: 'fig-paper' }],
    ['path', { d: 'M23 16 Q23 6 30 6 Q37 6 37 16 Z', class: 'fig-paper' }],
    ['path', { d: 'M23.5 12.5 h13 v3 h-13 Z', class: 'fig-ink' }],
  ],
  // two students sharing a bill, and a stool
  students: [18, 42].flatMap((cx) => [
    ['path', { d: kid(cx, 'torso'), class: 'fig-paper' }],
    ['circle', { cx, cy: 33, r: 7.5, class: 'fig-skin' }],
    ['path', { d: kid(cx, 'hair'), class: 'fig-ink' }],
  ]),
};

// a low plastic stool from the front: the seat's rim, and the arch cut between its legs
const STOOL = [
  ['path', { d: 'M5 5 Q5 1 9 1 L51 1 Q55 1 55 5 L55 9 L5 9 Z', class: 'stool-seat' }],
  [
    'path',
    { d: 'M8 9 L52 9 L48 34 L40 34 L38 21 Q30 15 22 21 L20 34 L12 34 Z', class: 'stool-legs' },
  ],
  ['path', { d: 'M11 14 L49 14', class: 'stool-rib' }],
];

function draw(document, viewBox, shapes, className) {
  const svg = document.createElementNS(SVG, 'svg');

  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');

  for (const [tag, attributes] of shapes) {
    const shape = document.createElementNS(SVG, tag);

    Object.entries(attributes).forEach(([name, value]) => shape.setAttribute(name, value));
    svg.append(shape);
  }

  return svg;
}

export const drawPerson = (document, kind) =>
  draw(document, '0 0 60 64', PEOPLE[kind] ?? PEOPLE.shopper, `person person-${kind}`);

export const drawStool = (document) => draw(document, '0 0 60 35', STOOL, 'stool-art');

// one long road: six raider zones, two mid-bosses and the Warden Ox at the end
export const ZONES = [
  {
    at: 250,
    left: 150,
    right: 534,
    label: 'Zone 1',
    waves: [
      ['grunt', 'grunt', 'grunt'],
      ['grunt', 'scrapper', 'grunt'],
    ],
  },
  {
    at: 760,
    left: 660,
    right: 1044,
    label: 'Zone 2',
    waves: [
      ['knife', 'grunt', 'sling'],
      ['scrapper', 'jackal', 'sling', 'knife'],
    ],
  },
  {
    at: 1280,
    left: 1180,
    right: 1564,
    label: 'Zone 3',
    waves: [
      ['bomber', 'grunt', 'jackal'],
      ['shield', 'bomber', 'knife', 'sling'],
    ],
  },
  { at: 1720, left: 1616, right: 2000, label: 'Scrapyard', boss: true, waves: [['colossus']] },
  {
    at: 2240,
    left: 2140,
    right: 2524,
    label: 'Zone 4',
    waves: [
      ['sentry', 'assassin', 'grunt'],
      ['shield', 'sentry', 'assassin', 'jackal'],
    ],
  },
  {
    at: 2760,
    left: 2660,
    right: 3044,
    label: 'Zone 5',
    waves: [
      ['witch', 'juggernaut', 'scrapper'],
      ['vulture', 'scorpion', 'witch', 'knife'],
    ],
  },
  { at: 3280, left: 3176, right: 3560, label: 'The Nest', boss: true, waves: [['queen']] },
  {
    at: 3800,
    left: 3700,
    right: 4084,
    label: 'Zone 6',
    waves: [
      ['scorpion', 'vulture', 'juggernaut', 'sentry'],
      ['assassin', 'bomber', 'witch', 'shield'],
    ],
  },
  { at: 4320, left: 4216, right: 4600, label: 'Boss', boss: true, waves: [['brute']] },
];

export const CRATES = [
  { x: 205, item: 'sword' },
  { x: 455, item: 'ration' },
  { x: 705, item: 'spear' },
  { x: 990, item: 'ration' },
  { x: 1225, item: 'axe' },
  { x: 1500, item: 'sword' },
  { x: 1665, item: 'ration' },
  { x: 2190, item: 'spear' },
  { x: 2480, item: 'ration' },
  { x: 2700, item: 'axe' },
  { x: 3000, item: 'sword' },
  { x: 3230, item: 'ration' },
  { x: 3750, item: 'spear' },
  { x: 4050, item: 'ration' },
  { x: 4265, item: 'axe' },
  { x: 4550, item: 'ration' },
];

export const PROPS = [
  { kind: 'sandbags', x: 118 },
  { kind: 'barrel', x: 330 },
  { kind: 'barrel', x: 343 },
  { kind: 'sign', x: 470 },
  { kind: 'palm', x: 598 },
  { kind: 'sandbags', x: 862 },
  { kind: 'tank', x: 1062 },
  { kind: 'barrel', x: 1252 },
  { kind: 'palm', x: 1432 },
  { kind: 'sandbags', x: 1690 },
  { kind: 'barrel', x: 1960 },
  { kind: 'palm', x: 2100 },
  { kind: 'sign', x: 2380 },
  { kind: 'sandbags', x: 2620 },
  { kind: 'barrel', x: 2890 },
  { kind: 'barrel', x: 2903 },
  { kind: 'palm', x: 3150 },
  { kind: 'sandbags', x: 3420 },
  { kind: 'sign', x: 3660 },
  { kind: 'palm', x: 3940 },
  { kind: 'sandbags', x: 4180 },
  { kind: 'wall', x: 4588 },
];

export const TANK_SMOKE_X = 1092;
export const REINFORCEMENT_KINDS = ['grunt', 'knife', 'sling'];

export const ZONES = [
  {
    at: 250,
    left: 150,
    right: 534,
    label: 'Zone 1',
    waves: [
      ['grunt', 'grunt', 'grunt'],
      ['grunt', 'knife', 'grunt'],
    ],
  },
  {
    at: 760,
    left: 660,
    right: 1044,
    label: 'Zone 2',
    waves: [
      ['grunt', 'knife', 'sling'],
      ['knife', 'grunt', 'sling', 'knife'],
    ],
  },
  {
    at: 1280,
    left: 1180,
    right: 1564,
    label: 'Zone 3',
    waves: [
      ['grunt', 'shield', 'knife', 'grunt'],
      ['sling', 'knife', 'shield', 'sling'],
    ],
  },
  { at: 1720, left: 1616, right: 2000, label: 'Boss', boss: true, waves: [['brute']] },
];

export const CRATES = [
  { x: 205, item: 'sword' },
  { x: 455, item: 'ration' },
  { x: 705, item: 'spear' },
  { x: 990, item: 'ration' },
  { x: 1225, item: 'axe' },
  { x: 1500, item: 'sword' },
  { x: 1665, item: 'ration' },
  { x: 1950, item: 'axe' },
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
  { kind: 'wall', x: 1988 },
];

export const TANK_SMOKE_X = 1092;
export const REINFORCEMENT_KINDS = ['grunt', 'knife', 'sling'];

export const SALT_FLATS = {
  name: 'Salt Flats',
  theme: 'salt',
  boss: 'gnoll',
  reinforcements: ['hound', 'monk', 'vulture'],
  crates: ['ration', 'sword', 'spear', 'ration', 'axe', 'ration'],
  props: ['sandbags', 'sign', 'barrel'],
  zones: [
    {
      screens: 2,
      waves: [
        ['monk', 'grunt', 'monk'],
        ['vulture', 'hound', 'knife'],
        ['monk', 'vulture', 'scorpion', 'hound'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['assassin', 'monk', 'sling'],
        ['vulture', 'vulture', 'shield'],
        ['monk', 'assassin', 'bomber'],
        ['assassin', 'vulture', 'monk', 'hound'],
      ],
    },
    { boss: 'khan', label: 'Khan Returns' },
    {
      screens: 2,
      waves: [
        ['monk', 'sentry', 'assassin'],
        ['hound', 'hound', 'vulture'],
        ['assassin', 'monk', 'sentry', 'shield'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['vulture', 'monk', 'assassin', 'spitter'],
        ['hound', 'assassin', 'monk', 'vulture'],
      ],
    },
    { boss: 'gnoll', label: 'Bone Pens' },
  ],
};

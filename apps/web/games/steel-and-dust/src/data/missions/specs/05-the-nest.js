export const THE_NEST = {
  name: 'The Nest',
  theme: 'ember',
  boss: 'queen',
  reinforcements: ['scorpion', 'sentry', 'jackal'],
  crates: ['spear', 'ration', 'axe', 'sword', 'ration'],
  props: ['sandbags', 'barrel', 'sign', 'tank'],
  zones: [
    {
      screens: 2,
      waves: [
        ['scorpion', 'scorpion', 'jackal'],
        ['sentry', 'grunt', 'scorpion'],
        ['scorpion', 'sentry', 'hound', 'knife'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['sentry', 'shield', 'scorpion'],
        ['scorpion', 'scorpion', 'bomber'],
        ['spitter', 'sentry', 'jackal'],
        ['scorpion', 'shield', 'sentry', 'hound'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['scorpion', 'knife', 'sentry'],
        ['bomber', 'scorpion', 'spitter'],
        ['sentry', 'sentry', 'scorpion', 'shield'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['scorpion', 'scorpion', 'scorpion', 'jackal'],
        ['sentry', 'shield', 'scorpion', 'bomber'],
      ],
    },
    { boss: 'queen', label: 'Hive Heart' },
  ],
};

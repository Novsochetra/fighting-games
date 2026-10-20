export const SANDSTORM_PASS = {
  name: 'Sandstorm Pass',
  theme: 'storm',
  boss: 'djinn',
  reinforcements: ['witch', 'assassin', 'monk'],
  crates: ['axe', 'ration', 'sword', 'ration', 'spear', 'ration'],
  props: ['sign', 'sandbags', 'barrel', 'palm'],
  zones: [
    {
      screens: 2,
      waves: [
        ['witch', 'grunt', 'assassin'],
        ['juggernaut', 'knife'],
        ['witch', 'juggernaut', 'monk', 'jackal'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['assassin', 'assassin', 'sling'],
        ['witch', 'vulture', 'scorpion'],
        ['juggernaut', 'monk', 'bomber'],
        ['witch', 'witch', 'juggernaut', 'assassin'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['hound', 'monk', 'witch'],
        ['juggernaut', 'sentry', 'vulture'],
        ['assassin', 'witch', 'spitter', 'juggernaut'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['monk', 'monk', 'witch'],
        ['juggernaut', 'shield', 'sling'],
        ['assassin', 'vulture', 'hound'],
        ['witch', 'juggernaut', 'monk', 'assassin'],
      ],
    },
    { boss: 'djinn', label: 'Eye of the Storm' },
  ],
};

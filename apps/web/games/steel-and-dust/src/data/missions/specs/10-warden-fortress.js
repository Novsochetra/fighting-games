export const WARDEN_FORTRESS = {
  name: "Warden's Fortress",
  theme: 'bloodmoon',
  boss: 'brute',
  reinforcements: ['grunt', 'knife', 'sling'],
  crates: ['axe', 'ration', 'sword', 'ration', 'spear', 'ration', 'axe'],
  props: ['sandbags', 'barrel', 'tank', 'sign'],
  zones: [
    {
      screens: 2,
      waves: [
        ['shield', 'grunt', 'knife'],
        ['sentry', 'stoker', 'jackal'],
        ['shield', 'juggernaut', 'sling', 'knife'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['assassin', 'hound', 'bomber'],
        ['tombguard', 'ghoul', 'spitter'],
        ['monk', 'vulture', 'witch'],
        ['juggernaut', 'shield', 'sentry', 'assassin'],
      ],
    },
    { boss: 'ironhorn', label: 'Outer Gate' },
    {
      screens: 3,
      waves: [
        ['scorpion', 'scorpion', 'stoker'],
        ['witch', 'tombguard', 'hound'],
        ['bomber', 'sentry', 'monk'],
        ['juggernaut', 'stoker', 'shield', 'spitter'],
      ],
    },
    { boss: 'queen', label: 'Inner Keep' },
    {
      screens: 2,
      waves: [
        ['assassin', 'monk', 'vulture', 'knife'],
        ['juggernaut', 'shield', 'witch', 'sentry'],
      ],
    },
    { boss: 'brute', label: 'Warden Hall' },
  ],
};

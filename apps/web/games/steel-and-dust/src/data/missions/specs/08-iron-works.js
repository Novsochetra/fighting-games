export const IRON_WORKS = {
  name: 'Iron Works',
  theme: 'furnace',
  boss: 'furnace',
  reinforcements: ['stoker', 'scrapper', 'sentry'],
  crates: ['spear', 'ration', 'axe', 'sword', 'ration', 'axe'],
  props: ['barrel', 'tank', 'sandbags', 'barrel', 'sign'],
  zones: [
    {
      screens: 2,
      waves: [
        ['stoker', 'scrapper', 'stoker'],
        ['sentry', 'juggernaut', 'knife'],
        ['stoker', 'stoker', 'sentry', 'scrapper'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['bomber', 'stoker', 'jackal'],
        ['juggernaut', 'shield', 'sentry'],
        ['stoker', 'spitter', 'scrapper'],
        ['juggernaut', 'stoker', 'bomber', 'shield'],
      ],
    },
    { boss: 'colossus', label: 'Slag Gate' },
    {
      screens: 2,
      waves: [
        ['stoker', 'assassin', 'sentry'],
        ['juggernaut', 'juggernaut', 'sling'],
        ['stoker', 'shield', 'witch', 'scrapper'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['bomber', 'bomber', 'stoker'],
        ['sentry', 'stoker', 'hound'],
        ['juggernaut', 'monk', 'shield'],
        ['stoker', 'juggernaut', 'sentry', 'stoker'],
      ],
    },
    { boss: 'furnace', label: 'Great Furnace' },
  ],
};

export const MIRAGE_TEMPLE = {
  name: 'Mirage Temple',
  theme: 'twilight',
  boss: 'pharaoh',
  reinforcements: ['ghoul', 'tombguard', 'witch'],
  crates: ['sword', 'ration', 'axe', 'spear', 'ration', 'sword'],
  props: ['sign', 'palm', 'sandbags'],
  zones: [
    {
      screens: 2,
      waves: [
        ['ghoul', 'ghoul', 'ghoul'],
        ['tombguard', 'ghoul', 'witch'],
        ['tombguard', 'tombguard', 'ghoul', 'spitter'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['ghoul', 'witch', 'assassin'],
        ['tombguard', 'ghoul', 'sentry'],
        ['ghoul', 'ghoul', 'monk'],
        ['tombguard', 'witch', 'ghoul', 'scorpion'],
      ],
    },
    { boss: 'cobra', label: 'Serpent Shrine' },
    {
      screens: 2,
      waves: [
        ['ghoul', 'tombguard', 'vulture'],
        ['witch', 'witch', 'ghoul'],
        ['tombguard', 'ghoul', 'juggernaut', 'spitter'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['ghoul', 'ghoul', 'tombguard'],
        ['assassin', 'witch', 'ghoul'],
        ['tombguard', 'tombguard', 'monk'],
        ['ghoul', 'tombguard', 'witch', 'ghoul'],
      ],
    },
    { boss: 'pharaoh', label: 'Sun Throne' },
  ],
};

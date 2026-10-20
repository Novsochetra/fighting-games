export const SCRAPYARD = {
  name: 'Scrapyard',
  theme: 'smog',
  boss: 'colossus',
  reinforcements: ['scrapper', 'jackal', 'sling'],
  crates: ['ration', 'spear', 'sword', 'ration', 'axe'],
  props: ['barrel', 'tank', 'sandbags', 'sign'],
  zones: [
    {
      screens: 2,
      waves: [
        ['scrapper', 'grunt', 'scrapper'],
        ['jackal', 'grunt'],
        ['scrapper', 'jackal', 'grunt', 'knife'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['sling', 'grunt', 'grunt'],
        ['jackal', 'jackal', 'scrapper'],
        ['sling', 'scrapper', 'knife', 'jackal'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['knife', 'sling', 'scrapper'],
        ['jackal', 'grunt', 'jackal'],
        ['sling', 'sling', 'scrapper'],
        ['scrapper', 'jackal', 'knife', 'sling'],
      ],
    },
    { boss: 'colossus', label: 'Crusher Pit' },
  ],
};

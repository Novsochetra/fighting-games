export const RED_CANYON = {
  name: 'Red Canyon',
  theme: 'noon',
  boss: 'ironhorn',
  reinforcements: ['hound', 'grunt', 'bomber'],
  crates: ['axe', 'ration', 'sword', 'spear', 'ration'],
  props: ['palm', 'sandbags', 'sign', 'barrel'],
  zones: [
    {
      screens: 2,
      waves: [
        ['hound', 'grunt', 'hound'],
        ['bomber', 'grunt', 'knife'],
        ['hound', 'bomber', 'scrapper', 'grunt'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['jackal', 'hound', 'sling'],
        ['bomber', 'bomber', 'grunt'],
        ['hound', 'hound', 'knife', 'sling'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['bomber', 'scrapper', 'jackal'],
        ['hound', 'knife', 'hound'],
        ['sling', 'bomber', 'grunt'],
        ['hound', 'jackal', 'bomber', 'scrapper'],
      ],
    },
    { boss: 'ironhorn', label: 'Canyon Mouth' },
  ],
};

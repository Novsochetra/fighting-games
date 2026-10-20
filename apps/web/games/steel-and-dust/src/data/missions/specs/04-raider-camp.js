export const RAIDER_CAMP = {
  name: 'Raider Camp',
  theme: 'raiderCamp',
  boss: 'cobra',
  reinforcements: ['spitter', 'knife', 'shield'],
  crates: ['sword', 'ration', 'spear', 'axe', 'ration'],
  props: ['barrel', 'logs', 'sandbags', 'signpost', 'barrel'],
  zones: [
    {
      screens: 2,
      waves: [
        ['knife', 'spitter', 'grunt'],
        ['shield', 'grunt', 'knife'],
        ['spitter', 'shield', 'jackal', 'knife'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['spitter', 'spitter', 'hound'],
        ['shield', 'sling', 'scrapper'],
        ['knife', 'shield', 'spitter', 'bomber'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['hound', 'knife', 'spitter'],
        ['shield', 'shield', 'sling'],
        ['spitter', 'jackal', 'bomber'],
        ['shield', 'spitter', 'knife', 'hound'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['spitter', 'sling', 'scrapper', 'knife'],
        ['shield', 'hound', 'spitter', 'jackal'],
      ],
    },
    { boss: 'cobra', label: "Serpent's Tent" },
  ],
};

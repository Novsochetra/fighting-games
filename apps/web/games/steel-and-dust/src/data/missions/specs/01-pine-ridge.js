export const PINE_RIDGE = {
  name: 'Pine Ridge',
  theme: 'pineRidge',
  boss: 'khan',
  reinforcements: ['grunt', 'knife', 'scrapper'],
  crates: ['sword', 'ration', 'spear', 'ration', 'axe'],
  props: ['stump', 'signpost', 'logs', 'boulder', 'barrel'],
  zones: [
    {
      screens: 1,
      waves: [
        ['grunt', 'grunt', 'grunt'],
        ['grunt', 'scrapper', 'grunt'],
      ],
    },
    {
      screens: 2,
      waves: [
        ['knife', 'grunt'],
        ['grunt', 'scrapper', 'grunt'],
        ['knife', 'scrapper', 'grunt', 'grunt'],
      ],
    },
    {
      screens: 3,
      waves: [
        ['grunt', 'grunt', 'knife'],
        ['scrapper', 'knife'],
        ['grunt', 'scrapper', 'grunt'],
        ['knife', 'knife', 'scrapper', 'grunt'],
      ],
    },
    { boss: 'khan', label: 'Ridge Lookout' },
  ],
};

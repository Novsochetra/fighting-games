import { BRAZIL_SCENES } from './scenes-brazil.js';
import { ENDING_SCENES } from './scenes-ending.js';
import { EPILOGUE_SCENES } from './scenes-epilogue.js';
import { FINAL_SCENES } from './scenes-final.js';
import { MEXICO_SCENES } from './scenes-mexico.js';
import { NIGERIA_SCENES } from './scenes-nigeria.js';
import { SEMI_SCENES } from './scenes-semi.js';
import { WORLD_SCENES } from './scenes-world.js';
import { CUPS, STAGES } from './stages.js';

export const CHAPTER_4 = {
  id: 'chapter-4',
  number: 4,
  title: { en: 'The World Stage', km: 'ឆាកពិភពលោក' },
  format: '11',
  team: 'cambodia',
  heroAge: 'adult',
  cups: CUPS,
  stages: STAGES,
  scenes: {
    ...WORLD_SCENES,
    ...BRAZIL_SCENES,
    ...NIGERIA_SCENES,
    ...MEXICO_SCENES,
    ...SEMI_SCENES,
    ...FINAL_SCENES,
    ...ENDING_SCENES,
    ...EPILOGUE_SCENES,
  },
};

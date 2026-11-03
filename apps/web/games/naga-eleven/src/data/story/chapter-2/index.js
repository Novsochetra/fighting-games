import { ENDING_SCENES } from './scenes-ending.js';
import { FINAL_SCENES } from './scenes-final.js';
import { GROUP_SCENES } from './scenes-group.js';
import { SCHOOL_SCENES } from './scenes-school.js';
import { SEMI_SCENES } from './scenes-semi.js';
import { CUPS, STAGES } from './stages.js';

export const CHAPTER_2 = {
  id: 'chapter-2',
  number: 2,
  title: { en: 'Fire of Youth', km: 'ភ្លើងយុវវ័យ' },
  format: '11',
  team: 'kampong-cham-high',
  heroAge: 'teen',
  cups: CUPS,
  stages: STAGES,
  scenes: {
    ...SCHOOL_SCENES,
    ...GROUP_SCENES,
    ...SEMI_SCENES,
    ...FINAL_SCENES,
    ...ENDING_SCENES,
  },
};

import { ENDING_SCENES } from './scenes-ending.js';
import { FINAL_SCENES } from './scenes-final.js';
import { FRIENDLY_SCENES } from './scenes-friendly.js';
import { SEMI_SCENES } from './scenes-semi.js';
import { TRAINING_SCENES } from './scenes-training.js';
import { VILLAGE_SCENES } from './scenes-village.js';
import { CUPS, STAGES } from './stages.js';

export const CHAPTER_1 = {
  id: 'chapter-1',
  number: 1,
  title: { en: 'The Boy from Chrey Village', km: 'ក្មេងប្រុសមកពីភូមិជ្រៃ' },
  format: '7',
  team: 'chrey-school',
  heroAge: 'child',
  cups: CUPS,
  stages: STAGES,
  scenes: {
    ...VILLAGE_SCENES,
    ...TRAINING_SCENES,
    ...FRIENDLY_SCENES,
    ...SEMI_SCENES,
    ...FINAL_SCENES,
    ...ENDING_SCENES,
  },
};

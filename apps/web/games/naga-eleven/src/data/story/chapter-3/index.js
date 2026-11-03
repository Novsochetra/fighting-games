import { ENDING_SCENES } from './scenes-ending.js';
import { FINAL_SCENES } from './scenes-final.js';
import { JAPAN_SCENES } from './scenes-japan.js';
import { KOREA_SCENES } from './scenes-korea.js';
import { SEMI_SCENES } from './scenes-semi.js';
import { SQUAD_SCENES } from './scenes-squad.js';
import { THAILAND_SCENES } from './scenes-thailand.js';
import { CUPS, STAGES } from './stages.js';

export const CHAPTER_3 = {
  id: 'chapter-3',
  number: 3,
  title: { en: 'Asia Awakens', km: 'អាស៊ីភ្ញាក់រលឹក' },
  format: '11',
  team: 'cambodia-youth',
  heroAge: 'young',
  cups: CUPS,
  stages: STAGES,
  scenes: {
    ...SQUAD_SCENES,
    ...JAPAN_SCENES,
    ...THAILAND_SCENES,
    ...KOREA_SCENES,
    ...SEMI_SCENES,
    ...FINAL_SCENES,
    ...ENDING_SCENES,
  },
};

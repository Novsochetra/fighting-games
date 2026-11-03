import { NATIONAL_PIPING } from '../../../art/portraits/clothes.js';
import { piping } from '../props/piping.js';

// Cambodia's red, a vee of blue at the neck and white seams over the shoulders: what Sochetra and
// Rithy wear for their country from chapter 3
export const nationalKit = (neck) => ({
  colours: NATIONAL_PIPING,
  neck,
  collar: 'vee',
  chestProps: [piping({ top: 49, from: neck + 4, to: 21 })],
});

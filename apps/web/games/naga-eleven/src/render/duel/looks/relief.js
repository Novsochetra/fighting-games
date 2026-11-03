import { DUEL_INK } from '../../../art/duel/palette.js';

// a figure's own colours: o the ink, 0 to 4 its body from deep to light, e and w what burns in
// its eyes, m and n its accent
export const lookPalette = (art) => ({
  o: DUEL_INK,
  0: art.body[0],
  1: art.body[1],
  2: art.body[2],
  3: art.body[3],
  4: art.body[4],
  e: art.eye[1],
  w: art.eye[2],
  m: art.accent[2],
  n: art.accent[1],
  a: art.accent[3],
});

// the same figure carved into a cut-in's band: only the band's own dark tones, so the name stamped
// over it still reads
export const reliefPalette = (art) => ({
  o: art.body[0],
  0: art.body[0],
  1: art.body[0],
  2: art.body[1],
  3: art.body[2],
  4: art.body[2],
  e: art.body[3],
  w: art.body[3],
  m: art.body[1],
  n: art.body[0],
  a: art.body[2],
});

// a look's colours brought down to the band's dark tones, for a figure built of parts
export const reliefArt = (art) => ({
  ...art,
  body: [art.body[0], art.body[0], art.body[1], art.body[2], art.body[2]],
  accent: [art.body[0], art.body[0], art.body[1], art.body[2]],
  eye: [art.body[1], art.body[3], art.body[3]],
});

// how far into the cut-in a band's figure is, 0 as it slides in to 1 once it has
export const bandShare = (cut) => Math.min(1, cut.ticks / 14);

// a face of the Bayon, carved in sandstone and lit from the top left: o is the ink, 0 to 4 the
// stone from deep to light, n and m the lichen in its cracks; its eyes are the row EYE_ROW
export const BAYON_FACE = [
  '..........o..........',
  '.........o4o.........',
  '.........o4o.........',
  '........o443o........',
  '........o433o........',
  '.......ooooooo.......',
  '......om4o4o3mo......',
  '.....ooooooooooo.....',
  '....o4o4o4o3o3o3o....',
  '...ooooooooooooooo...',
  '..o444444443333333o..',
  '.o44111114330000033o.',
  'oo41344444333333203oo',
  'o4o300000433000002o3o',
  'o4o333334433322222o3o',
  'o3on3333443332222no2o',
  'o3o333311443002222o2o',
  'o3o33o333110222o22o2o',
  'o3o333o4444333o222o2o',
  'o3o3333o00000o2222o2o',
  '.o33333o44433o22222o.',
  '.oo3m33311100222m2oo.',
  '..o433333332222223o..',
  '...oo33333322222oo...',
  '....ooooooooooooo....',
  '..o444444443333333o..',
  '..ooooooooooooooooo..',
];

export const EYE_ROW = 13;

// the eyes open: e is their gold, w the white heat at their middle
export const OPEN_EYES = 'o4o30eew04330wee02o3o';

// where the two eyes sit in the face, in its pixels
export const EYES = [
  { x: 6, y: EYE_ROW },
  { x: 14, y: EYE_ROW },
];

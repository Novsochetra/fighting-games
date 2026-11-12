// The piggy bank, a letter a pixel (the colours are PIGGY in palette.js). The eyes are the two
// rows each mood swaps in.
const TOP = [
  '......................',
  '..ooo............ooo..',
  '.oplpo..........oplpo.',
  '.opdppoooooooooopdppo.',
  '.opppllllsssslllllppo.',
  'oppllpppppppppppppppdo',
  'oplpppppppppppppppppdo',
];

const BOTTOM = [
  'opbbppponnnnnnopbbpddo',
  'opbbppponhnnhnopbbpddo',
  'opppppponnnnnnopppdddo',
  '.opppppooooooooppdddo.',
  '.oppddddddddddddddddo.',
  '..oooddddddddddddooo..',
  '...opdoooooooooopdo...',
  '...oooo........oooo...',
];

const SNOUT_TOP = 'oppppppponnnnopppppddo';

const EYES = {
  idle: ['opppwepppppppppwepppdo', 'opppeepppppppppeepppdo'],
  blink: ['oppppppppppppppppppddo', 'opppeepppppppppeepppdo'],
  happy: ['opppeepppppppppeepppdo', 'oppeppeppppppeppepppdo'],
  sad: ['oppeppppppppppppepppdo', 'opppeepppppppppeepppdo'],
};

const TEAR = 'opppptpponnnnopppppddo';

export const PIGGY_SIZE = { width: 22, height: 18 };

export function piggyRows(mood) {
  const snoutTop = mood === 'sad' ? TEAR : SNOUT_TOP;

  return [...TOP, ...(EYES[mood] ?? EYES.idle), snoutTop, ...BOTTOM];
}

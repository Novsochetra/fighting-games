// The small pieces round the box, in the letters of ART_KEYS: the speaker's name plate (a ribbon
// of red silk edged in gold, pointed at both ends), the next arrow, the skip chevrons and the
// diamond that marks the narration's rules.

// the plate's middle, top to bottom, stretched under the name
export const PLATE_PROFILE = ['o', '4', '2', 'n', 'm', 'm', 'm', 'm', 'm', 'l', '2', 'o'];

// the plate's left end; the right end is the same, turned round
export const PLATE_END = [
  '.....o',
  '....o4',
  '...o42',
  '..o4nn',
  '.o4mmm',
  'o4m5mm',
  'o2m3mm',
  '.o2mmm',
  '..o2mm',
  '...o2l',
  '....o2',
  '.....o',
];

export const NEXT_ARROW = [
  'ooooooooo',
  'o5444432o',
  '.o44332o.',
  '..o432o..',
  '...o2o...',
  '....o....',
];

export const SKIP_CHEVRONS = [
  'o...o...',
  '5o..5o..',
  '45o.45o.',
  '343o343o',
  '32o.32o.',
  '2o..2o..',
  'o...o...',
];

export const RULE_DIAMOND = [
  '...o...',
  '..o5o..',
  '.o4p3o.',
  'o43n32o',
  '.o2m1o.',
  '..o1o..',
  '...o...',
];

// the narration band's ends fade out in steps, as a pixel artist would, never a smooth ramp
export const CAPTION_FADE = [0.12, 0.24, 0.38, 0.52, 0.66, 0.8, 0.9];

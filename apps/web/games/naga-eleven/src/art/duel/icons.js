// the menu's little pictures, 7 by 7: o is the outline, the digits a ramp from deep (1) to light (4)
export const ICON_PALETTE = {
  plain: { o: '#0a0912', 1: '#3a4466', 2: '#7a88aa', 3: '#c4cee4', 4: '#ffffff' },
  special: { o: '#0a0912', 1: '#7a3a08', 2: '#d08a1c', 3: '#ffd04a', 4: '#fff6c0' },
  spirit: { o: '#0a0912', 1: '#0c3a5a', 2: '#1c78a8', 3: '#46c0e8', 4: '#d8faff' },
  skill: { o: '#0a0912', 1: '#0c4a3a', 2: '#1c9a6a', 3: '#5ae0a0', 4: '#e0fff0' },
  combo: { o: '#0a0912', 1: '#5a0a3a', 2: '#b02a7a', 3: '#ff6ab8', 4: '#ffe0f4' },
};

export const ICONS = {
  dribble: ['..ooo..', '.o333o.', 'o32223o', 'o32123o', 'o32223o', '.o333o.', '..ooo..'],
  pass: ['...o...', '...oo..', 'oooo4o.', 'o3333o.', 'oooo2o.', '...oo..', '...o...'],
  shot: ['o..o..o', '.o.4.o.', '..o3o..', 'o4323o4', '..o3o..', '.o.4.o.', 'o..o..o'],
  tackle: ['.......', '..oo...', '.o43o..', '.o32oo.', '.o3223o', 'oo2222o', 'ooooooo'],
  block: ['ooooooo', 'o44443o', 'o43332o', 'o43332o', '.o332o.', '..o2o..', '...o...'],
  intercept: ['.o.o.o.', 'o4o4o4o', 'o3o3o3o', 'o33333o', 'o23332o', '.o222o.', '..ooo..'],
  catch: ['.oo.oo.', 'o44o44o', 'o33o33o', 'o33333o', 'o23332o', '.o222o.', '..ooo..'],
  punch: ['.oooo..', 'o4444o.', 'o3333oo', 'o33332o', 'o22222o', '.o2222o', '..oooo.'],
  special: ['...o...', '..o4o..', '.o434o.', 'o43234o', '.o323o.', '..o2o..', '...o...'],
  // a player's own skill: a spark of spirit
  skill: ['...oo..', '..o4o..', '.o43o..', 'o4333oo', '..o32o.', '..o2o..', '..oo...'],
  // two players striking together, one skill run into the next (as a chain's ">" reads), and a
  // pass combo's wave
  duo: ['.o...o.', 'o4o.o3o', '.o...o.', 'o44o33o', 'o43o32o', 'o3o.o2o', 'oo...oo'],
  chain: ['oo.oo..', 'o4oo4o.', '.o4oo4o', '..o3oo3', '.o3oo2o', 'o2oo2o.', 'oo.oo..'],
  combo: ['.......', '.oo....', 'o44o.oo', 'o3o3o3o', 'o2.o32o', '.....o.', '.......'],
  cursor: ['oo.....', 'o4o....', 'o34o...', 'o334o..', 'o34o...', 'o4o....', 'oo.....'],
};

// the little plates a menu row wears beside its name: what lifts it, what kind of combo it is, and
// FREE where the picker pays nothing
export const TAG_ART = {
  bonus: { back: '#7a3a08', edge: '#ffd04a', text: '#fff6c0' },
  duo: { back: '#5a0a3a', edge: '#ff6ab8', text: '#ffe0f4' },
  chain: { back: '#2a1a5a', edge: '#a08aff', text: '#f0e8ff' },
  free: { back: '#0c4a3a', edge: '#5ae0a0', text: '#e0fff0' },
};

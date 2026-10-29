const STEER = { up: 'up', right: 'right', down: 'down', left: 'left' };

// the controls as they always stood: no `at`, so styles/touch-buttons.css places the buttons (ULT
// moving up on an upright phone) and the screen fit rests the stick (stage-layout.js)
const CONTROLS = [
  { id: 'stick', kind: 'stick', inputs: STEER, class: 'classic-stick' },
  { id: 'ult', kind: 'button', inputs: ['ult'], label: 'ULT', class: 'tb tb-ult' },
  { id: 'dash', kind: 'button', inputs: ['dash'], label: 'DASH', class: 'tb tb-dash' },
  { id: 'jump', kind: 'button', inputs: ['jump'], label: 'JUMP', class: 'tb tb-jump' },
  { id: 'heavy', kind: 'button', inputs: ['heavy'], label: 'HEAVY', class: 'tb tb-heavy' },
  { id: 'light', kind: 'button', inputs: ['light'], label: 'ATTACK', class: 'tb tb-atk' },
];

// one layout for both ways of holding the phone, so a turn never draws the pad again
const LAYOUT = { items: CONTROLS };

export const CLASSIC = {
  id: 'classic',
  name: 'Classic',
  about: 'The stick and round buttons Steel & Dust began with',
  layouts: { landscape: LAYOUT, portrait: LAYOUT },
};

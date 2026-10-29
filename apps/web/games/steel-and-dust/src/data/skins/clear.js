const STEER = { up: 'up', right: 'right', down: 'down', left: 'left' };

// every move is a round key, DASH and ULT on the shell's shoulders as much as the face keys, unless
// the player picks pills for those two (`shapes`). `place` is where the key stands (`at`) and how
// big it is (`size`, `aspect`)
const control = (id, label, place) => ({
  id,
  kind: 'button',
  inputs: [id],
  label,
  class: `clear-button clear-${id}`,
  ...place,
});

// held sideways the game sits in the middle of the shell, in a bezel between two panels: the d-pad
// in the left one, ATTACK, JUMP and HEAVY in the right, each hung off a corner of the safe area
const LANDSCAPE = {
  screen: { left: 170, right: 170, top: 12, bottom: 12 },
  items: [
    {
      id: 'dpad',
      kind: 'dpad',
      inputs: STEER,
      class: 'clear-dpad',
      at: { x: 0, y: 1, dx: 92, dy: -140 },
      size: 128,
    },
    control('dash', 'DASH', { at: { x: 0, y: 0, dx: 85, dy: 48 }, size: 64 }),
    control('ult', 'ULT', { at: { x: 1, y: 0, dx: -85, dy: 48 }, size: 64 }),
    control('heavy', 'HEAVY', { at: { x: 1, y: 1, dx: -122, dy: -228 }, size: 62 }),
    control('jump', 'JUMP', { at: { x: 1, y: 1, dx: -114, dy: -112 }, size: 70 }),
    control('light', 'ATTACK', { at: { x: 1, y: 1, dx: -50, dy: -178 }, size: 76 }),
  ],
};

// upright the game sits at the top of the shell and the controls below it, as on a handheld
const PORTRAIT = {
  screen: { left: 14, right: 14, top: 16, align: 'top' },
  items: [
    {
      id: 'dpad',
      kind: 'dpad',
      inputs: STEER,
      class: 'clear-dpad',
      at: { x: 0, y: 1, dx: 95, dy: -230 },
      size: 140,
    },
    control('dash', 'DASH', { at: { x: 0, y: 1, dx: 95, dy: -390 }, size: 62 }),
    control('ult', 'ULT', { at: { x: 1, y: 1, dx: -95, dy: -390 }, size: 62 }),
    control('heavy', 'HEAVY', { at: { x: 1, y: 1, dx: -150, dy: -318 }, size: 66 }),
    control('jump', 'JUMP', { at: { x: 1, y: 1, dx: -140, dy: -195 }, size: 76 }),
    control('light', 'ATTACK', { at: { x: 1, y: 1, dx: -70, dy: -262 }, size: 84 }),
  ],
};

// DASH and ULT as pills on the shoulders, as a handheld's bumpers, shaped as their art is
// (assets/skins/clear/key-pill.webp, 386 by 170), standing where the round keys do
const pill = (id, label, place) => ({
  ...control(id, label, { ...place, aspect: 0.44 }),
  class: `clear-button clear-pill clear-${id}`,
});

// sideways the pills stand out toward the corners, clear of the Skins screen's bar on a small phone
const SHOULDER_PILLS = {
  landscape: [
    pill('dash', 'DASH', { at: { x: 0, y: 0, dx: 78, dy: 36 }, size: 96 }),
    pill('ult', 'ULT', { at: { x: 1, y: 0, dx: -78, dy: 36 }, size: 96 }),
  ],
  portrait: [
    pill('dash', 'DASH', { at: { x: 0, y: 1, dx: 95, dy: -392 }, size: 104 }),
    pill('ult', 'ULT', { at: { x: 1, y: 1, dx: -95, dy: -392 }, size: 104 }),
  ],
};

const withPills = (layout, pills) => ({
  ...layout,
  items: layout.items.map((item) => pills.find((key) => key.id === item.id) ?? item),
});

const COLOURS = {
  lotus: ['Clear Lotus', 'See-through lotus purple'],
  ember: ['Clear Ember', 'See-through ember red'],
  jade: ['Clear Jade', 'See-through jade green'],
  mekong: ['Clear Mekong', 'See-through Mekong blue'],
  smoke: ['Clear Smoke', 'See-through smoke grey'],
};

// the controls stand in the touch layer, not in the shell, so each carries its shell's colour too
function coloured(layout, colour) {
  return {
    ...layout,
    shell: { class: `clear clear-${colour}` },
    items: layout.items.map((item) => ({ ...item, class: `${item.class} clear-${colour}` })),
  };
}

function clearSkin(colour, [name, plastic]) {
  return {
    id: `clear-${colour}`,
    name,
    // one line on a phone held sideways, so the bar clears the keys under it
    about: `${plastic}, its insides showing`,
    layouts: {
      landscape: coloured(LANDSCAPE, colour),
      portrait: coloured(PORTRAIT, colour),
    },
    shapes: {
      pill: {
        landscape: coloured(withPills(LANDSCAPE, SHOULDER_PILLS.landscape), colour),
        portrait: coloured(withPills(PORTRAIT, SHOULDER_PILLS.portrait), colour),
      },
    },
  };
}

// one shell in five colours of see-through plastic, our own handheld drawn in CSS over our own
// insides art (assets/skins/clear/)
export const CLEAR_SKINS = Object.fromEntries(
  Object.entries(COLOURS).map(([colour, words]) => [`clear-${colour}`, clearSkin(colour, words)]),
);

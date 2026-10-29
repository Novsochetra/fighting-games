const STEER = { up: 'up', right: 'right', down: 'down', left: 'left' };

// every move is a round key, DASH and ULT on the shell's shoulders as much as the face keys, unless
// the player picks a pill for either of those two (`pills`). `place` is where the key stands (`at`)
// and how big it is (`size`, `aspect`)
const control = (id, label, place) => ({ id, kind: 'button', inputs: [id], label, ...place });

const dpad = (place) => ({ id: 'dpad', kind: 'dpad', inputs: STEER, ...place });

// held sideways the game sits in the middle of the shell, in a bezel between two panels: the d-pad
// in the left one, ATTACK, JUMP and HEAVY in the right, each hung off a corner of the safe area
const LANDSCAPE = {
  screen: { left: 170, right: 170, top: 12, bottom: 12 },
  items: [
    dpad({ at: { x: 0, y: 1, dx: 92, dy: -140 }, size: 128 }),
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
    dpad({ at: { x: 0, y: 1, dx: 95, dy: -230 }, size: 140 }),
    control('dash', 'DASH', { at: { x: 0, y: 1, dx: 95, dy: -390 }, size: 62 }),
    control('ult', 'ULT', { at: { x: 1, y: 1, dx: -95, dy: -390 }, size: 62 }),
    control('heavy', 'HEAVY', { at: { x: 1, y: 1, dx: -150, dy: -318 }, size: 66 }),
    control('jump', 'JUMP', { at: { x: 1, y: 1, dx: -140, dy: -195 }, size: 76 }),
    control('light', 'ATTACK', { at: { x: 1, y: 1, dx: -70, dy: -262 }, size: 84 }),
  ],
};

// DASH and ULT as pills on the shoulders, as a handheld's bumpers, standing where the round keys
// do; sideways they stand out toward the corners, clear of the Skins screen's bar on a small phone
const SHOULDER_PILLS = {
  landscape: [
    control('dash', 'DASH', { at: { x: 0, y: 0, dx: 78, dy: 36 }, size: 96 }),
    control('ult', 'ULT', { at: { x: 1, y: 0, dx: -78, dy: 36 }, size: 96 }),
  ],
  portrait: [
    control('dash', 'DASH', { at: { x: 0, y: 1, dx: 95, dy: -392 }, size: 104 }),
    control('ult', 'ULT', { at: { x: 1, y: 1, dx: -95, dy: -392 }, size: 104 }),
  ],
};

// the controls stand in the touch layer, not in the shell, so each carries the shell's own classes
// too (`tint`, a Clear shell's colour)
const classOf = (prefix, tint, names) => [...names, tint].filter(Boolean).join(' ');

function dressed(item, { prefix, tint }) {
  const names =
    item.kind === 'dpad' ? [`${prefix}-dpad`] : [`${prefix}-button`, `${prefix}-${item.id}`];

  return { ...item, class: classOf(prefix, tint, names) };
}

const dressedPill = (item, look) => ({
  ...item,
  aspect: look.pillAspect,
  class: classOf(look.prefix, look.tint, [
    `${look.prefix}-button`,
    `${look.prefix}-pill`,
    `${look.prefix}-${item.id}`,
  ]),
});

const layoutOf = (layout, look) => ({
  ...layout,
  shell: { class: classOf(look.prefix, look.tint, [look.prefix]) },
  items: layout.items.map((item) => dressed(item, look)),
});

// a skin drawn as a handheld: its shell and controls painted by the skin's stylesheet through the
// classes named from `prefix` (and `tint`), its pills shaped as its pill art is (`pillAspect`)
export function handheldSkin({ id, name, about, ...look }) {
  return {
    id,
    name,
    about,
    layouts: { landscape: layoutOf(LANDSCAPE, look), portrait: layoutOf(PORTRAIT, look) },
    pills: {
      landscape: SHOULDER_PILLS.landscape.map((item) => dressedPill(item, look)),
      portrait: SHOULDER_PILLS.portrait.map((item) => dressedPill(item, look)),
    },
  };
}

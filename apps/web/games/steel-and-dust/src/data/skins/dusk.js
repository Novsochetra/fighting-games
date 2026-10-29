const STEER = { up: 'up', right: 'right', down: 'down', left: 'left' };

const button = (id, label, at, size) => ({
  id,
  kind: 'button',
  inputs: [id],
  label,
  class: `dusk dusk-${id}`,
  at,
  size,
});

// each control hangs off a bottom corner by px at Button size 1, so the cluster keeps its shape
// from a small phone to a tablet, far enough in to clear a notch held sideways
const LANDSCAPE = [
  {
    id: 'dpad',
    kind: 'dpad',
    inputs: STEER,
    class: 'dusk-dpad',
    at: { x: 0, y: 1, dx: 140, dy: -112 },
    size: 150,
  },
  button('ult', 'ULT', { x: 1, y: 1, dx: -318, dy: -112 }, 62),
  button('dash', 'DASH', { x: 1, y: 1, dx: -214, dy: -162 }, 62),
  button('jump', 'JUMP', { x: 1, y: 1, dx: -100, dy: -198 }, 72),
  button('heavy', 'HEAVY', { x: 1, y: 1, dx: -222, dy: -60 }, 74),
  button('light', 'ATTACK', { x: 1, y: 1, dx: -120, dy: -92 }, 92),
];

// upright, the stage stands over the controls, which climb higher to keep a narrow screen's
// thumbs apart: the buttons a diamond in the right half, the d-pad in the left
const PORTRAIT = [
  {
    id: 'dpad',
    kind: 'dpad',
    inputs: STEER,
    class: 'dusk-dpad',
    at: { x: 0, y: 1, dx: 88, dy: -190 },
    size: 140,
  },
  button('ult', 'ULT', { x: 1, y: 1, dx: -128, dy: -340 }, 62),
  button('dash', 'DASH', { x: 1, y: 1, dx: -176, dy: -228 }, 62),
  button('jump', 'JUMP', { x: 1, y: 1, dx: -78, dy: -268 }, 74),
  button('heavy', 'HEAVY', { x: 1, y: 1, dx: -172, dy: -112 }, 74),
  button('light', 'ATTACK', { x: 1, y: 1, dx: -78, dy: -150 }, 92),
];

// glass discs lit by the dusk sky, over the fight, and a d-pad for grid-sure steps
export const DUSK = {
  id: 'dusk',
  name: 'Dusk',
  about: 'A d-pad and glass buttons lit by the dusk sky, over the fight',
  layouts: { landscape: { items: LANDSCAPE }, portrait: { items: PORTRAIT } },
};

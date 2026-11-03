const STEER = { up: 'up', right: 'right', down: 'down', left: 'left' };

// styles/touch.css paints them: glass discs, and a gold rim on what `gold` names
const button = (id, label, at, { size, gold = false }) => ({
  id,
  kind: 'button',
  inputs: [id],
  label,
  class: gold ? `pitch-button pitch-gold pitch-${id}` : `pitch-button pitch-${id}`,
  at,
  size,
});

const stick = (at, size) => ({
  id: 'stick',
  kind: 'stick',
  inputs: STEER,
  class: 'pitch-stick',
  at,
  size,
});

// in the corner, clear of the score in the middle of the top
const pause = button('pause', 'II', { x: 1, y: 0, dx: -32, dy: 30 }, { size: 44 });

// sideways the keys keep to the side bars and the lower corners, behind the goal lines, as the
// camera at the end of its rail slants a goal line across the corner below its box: the stick in
// the lower left, and up the right edge SHOOT (the biggest), PASS and RUN; on a 16:9 phone, which
// has no side bars, a key a few px bigger or further in stands over the box or the goal
const LANDSCAPE = [
  stick({ x: 0.08, y: 0.87 }, 96),
  button('shoot', 'SHOOT', { x: 1, y: 1, dx: -42, dy: -42 }, { size: 76, gold: true }),
  button('pass', 'PASS', { x: 1, y: 1, dx: -36, dy: -122 }, { size: 60 }),
  button('sprint', 'RUN', { x: 1, y: 1, dx: -34, dy: -193 }, { size: 54 }),
  pause,
];

// upright (a tablet, as a phone shows the turn card) the stage stands over the controls
const PORTRAIT = [
  stick({ x: 0.25, y: 0.8 }, 128),
  button('shoot', 'SHOOT', { x: 1, y: 1, dx: -76, dy: -150 }, { size: 86, gold: true }),
  button('pass', 'PASS', { x: 1, y: 1, dx: -170, dy: -108 }, { size: 72 }),
  button('sprint', 'RUN', { x: 1, y: 1, dx: -150, dy: -220 }, { size: 58 }),
  pause,
];

export const PITCH_SIDE = {
  id: 'pitch-side',
  name: 'Pitch side',
  about: 'Glass pixel keys over the pitch: a stick, and PASS, RUN and a gold-rimmed SHOOT',
  layouts: { landscape: { items: LANDSCAPE }, portrait: { items: PORTRAIT } },
};

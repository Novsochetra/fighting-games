const STICK = ['up', 'down', 'left', 'right'];

// the inputs each drill reads while it runs (src/training/), so the touch pad shows only their
// keys: a key that does nothing there would only cover the stage, as RUN covers a target in Target
// Shot on a phone held sideways
const DRILL_KEYS = {
  'cone-dribble': [...STICK, 'sprint'],
  'target-shot': [...STICK, 'shoot'],
  'spirit-focus': ['pass'],
};

const RUNNING = new Set(['ready', 'play', 'finish']);

// the same list every frame while the drill runs (touch.show compares it), and null on its cards,
// which take every key
export const drillKeys = (state) => (RUNNING.has(state.phase) ? DRILL_KEYS[state.drill] : null);

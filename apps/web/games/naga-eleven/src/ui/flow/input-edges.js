import { isHeld, wasPressed } from '../../sim/input-state.js';

const MENU_ACTIONS = ['up', 'down', 'left', 'right', 'pass', 'shoot'];

// a pad holds its directions without pressing them, so a canvas menu tells a fresh push from the
// step a held stick was already making
export const createEdges = () => ({ held: {} });

export function pressedOf(edges, input) {
  const pressed = {};

  for (const action of MENU_ACTIONS) {
    const now = isHeld(input, action);

    pressed[action] = wasPressed(input, action) || (now && !edges.held[action]);
    edges.held[action] = now;
  }

  return pressed;
}

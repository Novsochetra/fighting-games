// keys, a pad and the touch controls each hold actions of their own (packages/input writes them),
// and share one list of what was pressed this tick
export function createInput() {
  const pressed = {};
  const source = () => ({ pressed, held: {} });

  return { pressed, sources: { keys: source(), pad: source(), touch: source() } };
}

export const isHeld = (input, action) =>
  Object.values(input.sources).some((source) => Boolean(source.held[action]));

export const wasPressed = (input, action) => Boolean(input.pressed[action]);

export function clearPresses(input) {
  for (const action of Object.keys(input.pressed)) {
    delete input.pressed[action];
  }
}

export function releaseAll(source) {
  for (const action of Object.keys(source.held)) {
    source.held[action] = false;
  }
}

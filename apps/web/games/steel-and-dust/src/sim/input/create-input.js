export function createInput() {
  return {
    held: {},
    pressed: {},
    buffer: {
      action: null,
      ttl: 0,
      up: false,
      down: false,
      direction: 0,
      upNew: false,
      downNew: false,
    },
    lastTap: { direction: 0, time: -99 },
    upPressedAt: -99,
    downPressedAt: -99,
    upWasHeld: false,
    downWasHeld: false,
    autoAttack: { on: false, since: 0 },
  };
}

export function clearPressed(input) {
  for (const key of Object.keys(input.pressed)) {
    input.pressed[key] = false;
  }
}

export function releaseAll(input) {
  for (const key of Object.keys(input.held)) {
    input.held[key] = false;
  }
}

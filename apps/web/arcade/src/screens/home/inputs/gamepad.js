export const STICK_THRESHOLD = 0.5;

// Standard gamepad mapping: 0 is A (bottom face button), 9 is Start, 12 to 15 are the d-pad.
const BUTTON_ACTIONS = [
  [0, 'start'],
  [9, 'start'],
  [12, 'up'],
  [13, 'down'],
  [14, 'left'],
  [15, 'right'],
];

const isPressed = (button) => Boolean(button) && (button.pressed || button.value > STICK_THRESHOLD);

function addStickActions(actions, [x = 0, y = 0]) {
  if (x < -STICK_THRESHOLD) {
    actions.add('left');
  }
  if (x > STICK_THRESHOLD) {
    actions.add('right');
  }
  if (y < -STICK_THRESHOLD) {
    actions.add('up');
  }
  if (y > STICK_THRESHOLD) {
    actions.add('down');
  }
}

export function readGamepadActions(gamepad) {
  const actions = new Set();
  if (!gamepad) {
    return actions;
  }
  for (const [buttonIndex, action] of BUTTON_ACTIONS) {
    if (isPressed(gamepad.buttons?.[buttonIndex])) {
      actions.add(action);
    }
  }
  addStickActions(actions, gamepad.axes ?? []);
  return actions;
}

export function readAllGamepads(gamepads) {
  const actions = new Set();
  for (const gamepad of gamepads ?? []) {
    readGamepadActions(gamepad).forEach((action) => actions.add(action));
  }
  return actions;
}

export function newlyPressed(previous, current) {
  return [...current].filter((action) => !previous.has(action));
}

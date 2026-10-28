import { BUFFER_TICKS, DOUBLE_TAP_TICKS, FRESH_DIRECTION_TICKS } from '../../config.js';

function bufferAction(game, action) {
  const { input, tickCount } = game;
  Object.assign(input.buffer, {
    action,
    ttl: BUFFER_TICKS,
    up: !!input.held.up,
    down: !!input.held.down,
    direction: 0,
    upNew: tickCount - input.upPressedAt <= FRESH_DIRECTION_TICKS,
    downNew: tickCount - input.downPressedAt <= FRESH_DIRECTION_TICKS,
  });
}

function trackDirectionPresses(game) {
  const { input, tickCount } = game;
  if (input.held.up && !input.upWasHeld) {
    input.upPressedAt = tickCount;
  }
  if (input.held.down && !input.downWasHeld) {
    input.downPressedAt = tickCount;
  }
  input.upWasHeld = !!input.held.up;
  input.downWasHeld = !!input.held.down;
}

function checkDoubleTap(game, direction) {
  const { input, tickCount } = game;
  const tap = input.lastTap;
  if (tap.direction === direction && tickCount - tap.time <= DOUBLE_TAP_TICKS) {
    bufferAction(game, 'dash');
    input.buffer.direction = direction;
    tap.time = -99;
  } else {
    tap.direction = direction;
    tap.time = tickCount;
  }
}

// later presses win, so up and heavy pressed together is a launcher, not a jump
export function readInput(game) {
  const pressed = game.input.pressed;
  trackDirectionPresses(game);
  if (pressed.up || pressed.jump) {
    bufferAction(game, 'jump');
  }
  if (pressed.dash) {
    bufferAction(game, 'dash');
  }
  if (pressed.left) {
    checkDoubleTap(game, -1);
  }
  if (pressed.right) {
    checkDoubleTap(game, 1);
  }
  for (const action of ['light', 'heavy', 'ult']) {
    if (pressed[action]) {
      bufferAction(game, action);
    }
  }
}

// touch: holding ATTACK keeps the light string going
export function repeatHeldAttack(game) {
  const { autoAttack } = game.input;
  if (!autoAttack.on || !game.settings.holdToCombo || game.mode !== 'play') {
    return;
  }
  const held = game.tickCount - autoAttack.since;
  if (held > 16 && held % 7 === 0) {
    game.input.pressed.light = true;
  }
}

export function expireBuffer(buffer) {
  if (buffer.ttl > 0 && --buffer.ttl === 0) {
    buffer.action = null;
  }
}

// the hero cannot act in a hit's freeze, so a press made on impact waits it out; aging it there let
// the freeze eat the buffer and dropped the next move of a string
export function ageBuffer(game) {
  if (game.player.hitstop > 0) {
    return;
  }

  expireBuffer(game.input.buffer);
}

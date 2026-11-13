import { installGestureGuards } from '../../../../packages/screen/src/gesture-guards.js';
import { RIEL } from '../data/currency.js';
import { installKeypad, typedFigure } from './keypad-input.js';

const DIGITS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8'];
const PAD = [
  'Numpad1',
  'Numpad2',
  'Numpad3',
  'Numpad4',
  'Numpad5',
  'Numpad6',
  'Numpad7',
  'Numpad8',
];
const COUNTER_KEYS = { Backspace: 'takeLast', Delete: 'clear', Enter: 'give', Space: 'give' };
const ESCAPE_CODES = ['Escape', 'KeyP'];

// A press acts at once, without waiting for the finger to lift; a key press on a focused button
// comes only as a click that no pointer made (detail 0).
function onPress(element, selector, act) {
  const valueOf = (event) => event.target.closest?.(selector)?.dataset.value;

  element.addEventListener('pointerdown', (event) => {
    if (event.button === 0 && valueOf(event) !== undefined) {
      act(Number(valueOf(event)));
    }
  });
  element.addEventListener('click', (event) => {
    if (event.detail === 0 && valueOf(event) !== undefined) {
      act(Number(valueOf(event)));
    }
  });
}

function installGive(give, actions) {
  give.dataset.value = '0';
  onPress(give, '.give', actions.give);
}

function installButtons(stage, actions) {
  stage.at.app.addEventListener('click', (event) => {
    const button = event.target.closest('[data-act], [data-op]');

    if (!button) {
      return;
    }

    stage.audio.play('tap');

    if (button.dataset.op) {
      actions.toggleOp(button.dataset.op);
    } else {
      actions[button.dataset.act]?.();
    }
  });
}

const pressesButton = (event) =>
  (event.code === 'Enter' || event.code === 'Space') && !!event.target.closest?.('button');

// Enter or Space on a focused bundle, pile or button presses that button, as the browser's own
// click does: only with nothing focused do they give the count
function counterKey(event, stage, actions) {
  const piece = Math.max(DIGITS.indexOf(event.code), PAD.indexOf(event.code));
  const typing = stage.game.run.mode === 'keypad';
  const figure = typing ? typedFigure(event, stage.at.keypad) : undefined;

  if (pressesButton(event)) {
    return;
  }

  if (figure !== undefined) {
    actions.type(figure);
  } else if (piece >= 0 && !typing) {
    actions.deal(RIEL.pieces[piece]);
  } else if (event.code in COUNTER_KEYS) {
    event.preventDefault();
    actions[COUNTER_KEYS[event.code]]();
  }
}

// with the shutter down, Enter and Space belong to the menu's own buttons
function installKeys(stage, actions) {
  stage.window.addEventListener('keydown', (event) => {
    if (event.repeat) {
      return;
    }

    if (ESCAPE_CODES.includes(event.code)) {
      actions.escape();
    } else if (!stage.menus.isDown) {
      counterKey(event, stage, actions);
    }
  });
}

// A clicked bundle, pile or key would keep the focus, and Enter would press it again instead of
// giving the count; the keyboard still reaches them with Tab.
function keepFocusOff(surfaces) {
  for (const surface of surfaces) {
    surface.addEventListener('mousedown', (event) => event.preventDefault());
  }
}

export function installInput(stage, actions) {
  const { window, document, at } = stage;

  onPress(at.till, '.bundle', actions.deal);
  onPress(at.piles, '.pile', actions.take);
  installKeypad(at.keypad, actions);
  installGive(at.give, actions);
  installButtons(stage, actions);
  installKeys(stage, actions);
  keepFocusOff([at.till, at.piles, at.keypad, at.give]);
  installGestureGuards({
    window,
    document,
    root: at.app,
    surfaces: [at.till, at.piles, at.give, at.keypad],
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      actions.pause();
    }
  });
}

import { menuStep } from '../../../../../packages/input/src/menu-repeat.js';
import { CONFIRM, readPad, START, steerFromPad } from '../../input/gamepad.js';
import { pauseApp } from './game-app.js';

const BACK = 1;

const ARROWS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

// while a DOM screen is up the pad walks its buttons: A presses, B goes back, Start pauses
function padOnScreens(app, padState, reading) {
  const step = menuStep(padState, reading.directions, app.frames);

  if (step) {
    app.screens.navigate(step);
    app.sound?.('cursor');
  }

  if (reading.presses[CONFIRM]) {
    app.screens.confirm();
  } else if (reading.presses[BACK]) {
    app.screens.back();
  }
}

export function stepPad(app, { navigator, padState }) {
  const reading = readPad(navigator, padState);
  const source = app.input.sources.pad;

  if (reading) {
    app.device = 'pad';
  }

  if (reading?.presses[START]) {
    togglePause(app);
  }

  if (reading && app.screens.current()) {
    steerFromPad(source, null);
    padOnScreens(app, padState, reading);
  } else {
    steerFromPad(source, reading);
  }
}

export function togglePause(app) {
  if (app.screens.current() === 'pause') {
    app.screens.back();
  } else {
    pauseApp(app);
  }
}

// Escape and P go back on a DOM screen and pause a match; the arrows walk a DOM screen's buttons
export function installScreenKeys(window, app) {
  window.addEventListener('keydown', (event) => {
    const step = ARROWS[event.code];

    if (step && app.screens.current()) {
      event.preventDefault();
      app.screens.navigate(step);
      app.sound?.('cursor');
    }
  });
}

export function onPauseKey(app) {
  if (app.screens.current() && app.screens.current() !== 'pause') {
    app.screens.back();
  } else {
    togglePause(app);
  }
}

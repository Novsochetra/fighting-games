import { pause } from '../sim/stage/flow.js';

function pressButton(button, { game, audio }, event) {
  const action = button.dataset.action;
  event.preventDefault();
  audio.unlock();
  game.input.pressed[action] = true;
  game.input.held[action] = true;
  button.classList.add('on');
  if (action === 'light') {
    game.input.autoAttack.on = true;
    game.input.autoAttack.since = game.tickCount;
  }
  button.setPointerCapture?.(event.pointerId);
}

function releaseButton(button, { game }) {
  const action = button.dataset.action;
  game.input.held[action] = false;
  button.classList.remove('on');
  if (action === 'light') {
    game.input.autoAttack.on = false;
  }
}

export function installTouchButtons(buttons, deps) {
  for (const button of buttons) {
    button.addEventListener('pointerdown', (event) => pressButton(button, deps, event));
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, () => releaseButton(button, deps));
    }
  }
}

export function installPauseButton(button, { game, audio }) {
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    audio.unlock();
    pause(game);
  });
}

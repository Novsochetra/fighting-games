import { installGestureGuards } from '../../../../packages/screen/src/gesture-guards.js';

const ANSWER_CODES = ['Digit1', 'Digit2', 'Digit3', 'Digit4'];
const NUMPAD_CODES = ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'];
const ESCAPE_CODES = ['Escape', 'KeyP'];

const answerOf = (event) => {
  const key = event.target.closest?.('[data-answer]');

  return key ? Number(key.dataset.answer) : null;
};

// A press answers at once, without waiting for the finger to lift; a key press on a focused
// answer comes only as a click that no pointer made (detail 0).
function installAnswers(answers, actions) {
  answers.addEventListener('pointerdown', (event) => {
    if (event.button === 0 && answerOf(event) !== null) {
      actions.answer(answerOf(event));
    }
  });
  answers.addEventListener('click', (event) => {
    if (event.detail === 0 && answerOf(event) !== null) {
      actions.answer(answerOf(event));
    }
  });
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

function installKeys(window, actions) {
  window.addEventListener('keydown', (event) => {
    const index = Math.max(ANSWER_CODES.indexOf(event.code), NUMPAD_CODES.indexOf(event.code));

    if (event.repeat) {
      return;
    }

    if (index >= 0) {
      actions.answer(index);
    } else if (ESCAPE_CODES.includes(event.code)) {
      actions.escape();
    }
  });
}

export function installInput(stage, actions) {
  const { window, document, at } = stage;

  installAnswers(at.answers, actions);
  installButtons(stage, actions);
  installKeys(window, actions);
  installGestureGuards({ window, document, root: at.app, surfaces: [at.answers] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      actions.pause();
    }
  });
}

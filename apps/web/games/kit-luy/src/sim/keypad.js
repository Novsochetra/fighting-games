import { TUNING } from '../data/tuning.js';

const DIGITS = /^\d+$/;

function typing(run) {
  return run.phase === 'serving' && run.mode === 'keypad';
}

function typed(run, next) {
  run.typed = next;
  run.events.push({ type: 'type', typed: next });
}

// an amount is never written with a leading zero, and never longer than the largest bill
export function typeDigits(run, digits) {
  if (!typing(run) || typeof digits !== 'string' || !DIGITS.test(digits)) {
    return;
  }

  const next = `${run.typed}${digits}`.replace(/^0+/, '');

  if (next !== run.typed && next.length <= TUNING.mostTyped) {
    typed(run, next);
  }
}

export function eraseDigit(run) {
  if (run.phase !== 'closed' && run.mode === 'keypad' && run.typed !== '') {
    typed(run, run.typed.slice(0, -1));
  }
}

export function clearTyped(run) {
  if (run.phase !== 'closed' && run.mode === 'keypad' && run.typed !== '') {
    typed(run, '');
  }
}

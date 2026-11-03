import { INSTRUMENTS, STEPS_PER_BAR } from '../../data/music/band.js';
import { HOLD, parseNote, REST, tokensOf } from './notes.js';

const compiled = new WeakMap();

function noteOf(instrument, token) {
  if (INSTRUMENTS[instrument].kind === 'drum') {
    return { instrument, hit: token, length: 1 };
  }

  const note = parseNote(token);

  return note && { instrument, midi: note.midi, octave: note.octave, roll: note.roll, length: 1 };
}

function lengthen(note) {
  if (note) {
    note.length += 1;
  }
}

function placeTrack(steps, instrument, bars) {
  let last = null;

  bars.flatMap(tokensOf).forEach((token, step) => {
    if (token === HOLD) {
      lengthen(last);

      return;
    }

    last = token === REST || step >= steps.length ? null : noteOf(instrument, token);

    if (last) {
      steps[step].push(last);
    }
  });
}

export function compileTheme(theme) {
  if (compiled.has(theme)) {
    return compiled.get(theme);
  }

  const totalSteps = theme.bars * STEPS_PER_BAR;
  const steps = Array.from({ length: totalSteps }, () => []);

  for (const [instrument, bars] of Object.entries(theme.tracks)) {
    placeTrack(steps, instrument, bars);
  }

  const result = {
    id: theme.id,
    loop: theme.loop,
    level: theme.level,
    stepSeconds: 60 / theme.bpm / 4,
    totalSteps,
    steps,
  };

  compiled.set(theme, result);

  return result;
}

import { INSTRUMENTS, STEPS_PER_BAR } from '../../data/music/band.js';
import { HOLD, parseNote, pitchClassOf, REST, tokensOf } from './notes.js';

function drumProblem(instrument, token) {
  if (token === HOLD) {
    return 'a drum cannot hold';
  }

  return instrument.hits.includes(token) ? null : `no hit ${token}`;
}

function noteProblem(instrument, scale, token) {
  const note = parseNote(token);

  if (!note) {
    return `no note ${token}`;
  }

  if (note.midi < instrument.low || note.midi > instrument.high) {
    return `${token} is out of range`;
  }

  return scale.has(note.pitchClass) ? null : `${token} is not in the scale`;
}

function tokenProblem(instrument, scale, token) {
  if (token === REST || (token === HOLD && instrument.kind !== 'drum')) {
    return null;
  }

  return instrument.kind === 'drum'
    ? drumProblem(instrument, token)
    : noteProblem(instrument, scale, token);
}

function holdProblems(where, tokens) {
  const loose = tokens.findIndex(
    (token, i) => token === HOLD && (i === 0 || tokens[i - 1] === REST),
  );

  return loose === -1 ? [] : [`${where}: step ${loose + 1} holds nothing`];
}

function trackProblems(theme, name, bars) {
  const instrument = INSTRUMENTS[name];
  const where = `${theme.id} ${name}`;
  const scale = new Set(theme.scale.map(pitchClassOf));

  if (!instrument) {
    return [`${where}: no such instrument`];
  }

  if (bars.length !== theme.bars) {
    return [`${where}: ${bars.length} bars, not ${theme.bars}`];
  }

  const problems = bars.flatMap((bar, i) => {
    const tokens = tokensOf(bar);
    const at = `${where} bar ${i + 1}`;

    if (tokens.length !== STEPS_PER_BAR) {
      return [`${at}: ${tokens.length} steps, not ${STEPS_PER_BAR}`];
    }

    return tokens
      .map((token) => tokenProblem(instrument, scale, token))
      .filter(Boolean)
      .map((problem) => `${at}: ${problem}`);
  });

  return [...problems, ...holdProblems(where, bars.flatMap(tokensOf))];
}

export function themeProblems(theme) {
  const problems = [];

  if (!(theme.bpm > 0) || !(theme.bars > 0)) {
    problems.push(`${theme.id}: needs a tempo and bars`);
  }

  if (new Set(theme.scale.map(pitchClassOf)).size !== 5) {
    problems.push(`${theme.id}: its scale is not pentatonic`);
  }

  for (const [name, bars] of Object.entries(theme.tracks)) {
    problems.push(...trackProblems(theme, name, bars));
  }

  return problems;
}

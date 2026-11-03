// a drill's marks (src/training/) to the cues they sound as
const MARK_CUES = {
  clean: 'coneClean',
  brush: 'cone',
  bump: 'cone',
  wrongSide: 'miss',
  finish: 'whistle',
  timeUp: 'whistle',
  hit: 'target',
  lateHit: 'target',
  net: 'net',
  saved: 'save',
  short: 'miss',
  over: 'miss',
  wide: 'miss',
  tooLate: 'miss',
  perfect: 'perfect',
  good: 'focusGood',
  miss: 'miss',
  stray: 'miss',
};

const MARK_OPTIONS = { finish: { kind: 'short' }, timeUp: { kind: 'long' } };

export const createTrainingEar = () => ({ state: null, ball: null, clock: null });

function markCue(event) {
  const cue = MARK_CUES[event?.type];

  return cue ? { cue, options: MARK_OPTIONS[event.type] ?? {} } : null;
}

// the target drill's ball is a new object each time it is struck
function strikeCues(run, ear) {
  const ball = run?.ball ?? null;
  const struck = ball !== null && ball !== ear.ball;

  ear.ball = ball;

  return struck ? [{ cue: 'kick', options: { power: ball.power } }] : [];
}

// the spirit-focus beat sounds as each beat's moment comes
function beatCues(run, ear) {
  if (!Array.isArray(run?.beats)) {
    return [];
  }

  const from = ear.clock ?? run.clock - 1;
  const due = run.beats.some((beat) => beat.at > from && beat.at <= run.clock);

  ear.clock = run.clock;

  return due ? [{ cue: 'focusBeat', options: {} }] : [];
}

export function trainingCues(state, ear) {
  if (ear.state !== state) {
    Object.assign(ear, createTrainingEar(), { state, ball: state.run?.ball ?? null });
  }

  const marks = (state.events ?? []).map(markCue).filter(Boolean);

  return [...strikeCues(state.run, ear), ...marks, ...beatCues(state.run, ear)];
}

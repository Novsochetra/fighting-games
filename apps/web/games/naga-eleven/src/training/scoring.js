// a mark is a word or a score that pops up where something happened, kept a moment for the drawing
export const MARK_TICKS = 72;

export const GRADES = ['C', 'B', 'A', 'S'];

export function gradeOf(score, topScore, thresholds) {
  const share = topScore > 0 ? score / topScore : 0;

  if (share >= thresholds.S) {
    return 'S';
  }

  if (share >= thresholds.A) {
    return 'A';
  }

  return share >= thresholds.B ? 'B' : 'C';
}

// the most a run of scoring moves can earn when each one builds the combo
export function comboTop({ count, base, step, cap }) {
  let points = 0;

  for (let i = 0; i < count; i += 1) {
    points += base + step * Math.min(i, cap);
  }

  return points;
}

export const isBetter = (grade, than) => GRADES.indexOf(grade) > GRADES.indexOf(than);

export function pushMark(state, mark) {
  const placed = { ...mark, at: state.tick };

  state.marks.push(placed);
  state.events.push({ type: mark.kind, ...mark });
}

export function pruneMarks(state) {
  state.marks = state.marks.filter((mark) => state.tick - mark.at < MARK_TICKS);
}

export function scorePoints(state, points) {
  state.score += points;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
}

export function breakCombo(state) {
  state.combo = 0;
}

export const held = (input, action) => Boolean(input?.held?.[action]);

export const pressed = (input, action) => Boolean(input?.pressed?.[action]);

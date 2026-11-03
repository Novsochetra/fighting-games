// Where a theme is in its steps. Step n of a playing starts at origin + n * stepSeconds, counted
// from the first step and on through every loop, so the beat never drifts from the clock.

export const startCursor = (origin) => ({ origin, count: 0, done: false });

export const timeOfStep = (compiled, cursor, count = cursor.count) =>
  cursor.origin + count * compiled.stepSeconds;

function finishIfOver(compiled, cursor) {
  if (!compiled.loop && cursor.count >= compiled.totalSteps) {
    cursor.done = true;
  }
}

export function dueNotes(compiled, cursor, until) {
  const notes = [];

  finishIfOver(compiled, cursor);

  while (!cursor.done && timeOfStep(compiled, cursor) < until) {
    const time = timeOfStep(compiled, cursor);

    for (const note of compiled.steps[cursor.count % compiled.totalSteps]) {
      notes.push({ ...note, time, duration: note.length * compiled.stepSeconds });
    }

    cursor.count += 1;
    finishIfOver(compiled, cursor);
  }

  return notes;
}

// after a stall (a hidden tab, a long frame) the theme picks up at the next step on the beat
// rather than rushing every step it missed
export function catchUp(compiled, cursor, now) {
  const due = Math.ceil((now - cursor.origin) / compiled.stepSeconds);

  if (due > cursor.count) {
    cursor.count = due;
    finishIfOver(compiled, cursor);
  }
}

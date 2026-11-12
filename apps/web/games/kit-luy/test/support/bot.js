import { advance, answer, createRun, drainEvents } from '../../src/sim/run.js';

const FRAME_MS = 16;

// A player with habits, so a recording has every kind of answer in it: this bot thinks a little
// longer on each level, and gets every `missEvery`th question wrong.
function think(run, ms) {
  for (let elapsed = 0; elapsed < ms && run.phase === 'asking'; elapsed += FRAME_MS) {
    advance(run, FRAME_MS);
  }
}

function settle(run) {
  while (run.phase === 'settling') {
    advance(run, FRAME_MS);
  }
}

const told = (question) => ({
  op: question.op,
  left: question.left,
  right: question.right,
  choices: question.choices,
  correctIndex: question.correctIndex,
});

export function playRecorded({ seed, ops, missEvery, thinkMs }) {
  const run = createRun({ seed, ops });
  const asked = [];

  while (run.phase !== 'over') {
    asked.push(told(run.question));
    think(run, thinkMs + run.level * 250);

    const miss = asked.length % missEvery === 0;

    answer(run, (run.question.correctIndex + (miss ? 1 : 0)) % run.question.choices.length);
    settle(run);
  }

  const events = drainEvents(run).filter((event) => event.type !== 'ask');
  const { score, correct, wrong, bestStreak, level, elapsed } = run;

  return { result: { score, correct, wrong, bestStreak, level, elapsed }, asked, events };
}

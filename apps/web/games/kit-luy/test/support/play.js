import { advance, answer } from '../../src/sim/run.js';

const wrongIndexOf = (run) => (run.question.correctIndex + 1) % run.question.choices.length;

// answers the question a run is asking, then lets the answer settle so the next one is asked
export function answerRight(run, afterMs = 0) {
  advance(run, afterMs);
  answer(run, run.question.correctIndex);
}

export function answerWrong(run) {
  answer(run, wrongIndexOf(run));
}

export function settle(run) {
  advance(run, 1000);
}

export const eventsOf = (run, type) => run.events.filter((event) => event.type === type);

import { piecesFor } from '../../src/sim/pieces.js';
import { advance, createRun, deal, drainEvents, give, takeBack } from '../../src/sim/run.js';

const STEP_MS = 16;
// far past any run the tuning allows, so a bot the stall cannot close still ends
const MOST_MS = 30 * 60 * 1000;
const TAPS = ['deal', 'take'];

function collect(play) {
  for (const event of drainEvents(play.run)) {
    if (event.type === 'ask') {
      play.asked.push(event.customer.question);
    }

    if (event.type === 'wrong') {
      play.wrongs += 1;
    }

    if (!TAPS.includes(event.type)) {
      play.events.push(event);
    }
  }
}

const isOver = (run) => run.phase === 'closed' || run.elapsed >= MOST_MS;

function wait(play, ms) {
  for (let waited = 0; waited < ms && !isOver(play.run); waited += STEP_MS) {
    advance(play.run, STEP_MS);
  }

  collect(play);
}

function waitOutLock(play) {
  while (play.run.phase === 'locked') {
    advance(play.run, STEP_MS);
  }

  collect(play);
}

function tap(play, act) {
  wait(play, play.tapMs);
  act(play.run);
  collect(play);
}

function dealAll(play, values) {
  for (const value of values) {
    tap(play, (run) => deal(run, value));
  }
}

// A miss counts one piece too many, the smallest in the till, gives, and takes it back: one too
// few would be no count at all when the answer is a single piece.
function serveBill(play, isMiss) {
  wait(play, play.thinkMs);

  const { run } = play;
  const way = piecesFor(run.queue[0].question.answer, run.pieces);
  const extra = Math.min(...run.pieces);

  dealAll(play, isMiss ? [...way, extra] : way);

  if (isMiss) {
    tap(play, give);
    waitOutLock(play);
    tap(play, (now) => takeBack(now, extra));
  }

  tap(play, give);
}

export function playRecorded({ seed, ops, thinkMs, tapMs, missEvery }) {
  const play = { run: createRun({ seed, ops }), thinkMs, tapMs, asked: [], events: [], wrongs: 0 };

  collect(play);

  let bills = 0;

  while (!isOver(play.run)) {
    bills += 1;
    serveBill(play, missEvery > 0 && bills % missEvery === 0);
  }

  const { takings, served, bestStreak, stage, elapsed } = play.run;

  return {
    result: { takings, served, bestStreak, stage, elapsed, bills, wrongs: play.wrongs },
    asked: play.asked,
    events: play.events,
  };
}

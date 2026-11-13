import { STAGES, stageOf } from '../data/stages.js';
import { TUNING } from '../data/tuning.js';
import { keepApart } from './customers.js';
import { speedOf, waitedMs } from './patience.js';
import { clothCount, clothPieces, clothTotal, fewestPieces, piecesFor } from './pieces.js';
import { askNext } from './serve-next.js';

function extraFor(streak) {
  if (streak % TUNING.streakPerExtra !== 0) {
    return 0;
  }

  return Math.min(TUNING.mostExtraPay, (TUNING.extraPay * streak) / TUNING.streakPerExtra);
}

// counting out in the fewest pieces earns its own pay; typing an amount counts no pieces
function isClean(run, answer) {
  return run.mode === 'money' && clothCount(run.cloth) === fewestPieces(answer, run.pieces);
}

function rewardFor(run, answer) {
  const clean = isClean(run, answer);
  const speed = speedOf(run);
  const extra = extraFor(run.streak);
  const pay = STAGES[run.stage - 1].pay;
  const speedPay = pay * TUNING.speedTimes[speed];
  const gain = pay + (clean ? TUNING.cleanPay : 0) + speedPay + extra;

  return { gain, pay, clean, speed, speedPay, waitedMs: waitedMs(run), extra };
}

function sendNextDoor(run) {
  if (run.queue.length >= 2) {
    run.events.push({ type: 'left', customer: run.queue.pop() });
    keepApart(run);
  }
}

function openStage(run) {
  const stage = stageOf(run.served);

  if (stage.number === run.stage) {
    return;
  }

  const added = stage.pieces.filter((value) => !run.pieces.includes(value));

  run.stage = stage.number;
  run.pieces = [...stage.pieces];
  run.showTotal = run.totalAlways || stage.showTotal;
  run.events.push({ type: 'stage', stage: stage.number, added });
}

function payCustomer(run) {
  const customer = run.queue.shift();
  const pieces =
    run.mode === 'money' ? clothPieces(run.cloth) : piecesFor(customer.question.answer, run.pieces);

  run.streak += 1;
  run.bestStreak = Math.max(run.bestStreak, run.streak);

  const reward = rewardFor(run, customer.question.answer);

  run.takings += reward.gain;
  run.speeds[reward.speed] += 1;
  run.served += 1;
  run.started = true;
  run.cloth = {};
  run.typed = '';
  run.tries = 0;
  run.events.push({
    type: 'paid',
    customer,
    pieces,
    ...reward,
    streak: run.streak,
    served: run.served,
  });

  if (reward.extra > 0) {
    sendNextDoor(run);
  }

  openStage(run);
  askNext(run);
}

function refuse(run, given, answer) {
  const direction = given < answer ? 'short' : 'over';

  run.tries += 1;
  run.streak = 0;
  run.phase = 'locked';
  run.lockLeft = TUNING.wrongLockMs;
  run.events.push({
    type: 'wrong',
    direction,
    by: run.tries === 1 ? null : Math.abs(answer - given),
    tries: run.tries,
  });

  if (run.tries === 1) {
    run.missed.push({ question: run.queue[0].question, given, direction });
  }
}

const givenOf = (run) => (run.mode === 'money' ? clothTotal(run.cloth) : Number(run.typed));

const hasGiven = (run) => (run.mode === 'money' ? clothCount(run.cloth) > 0 : run.typed !== '');

export function give(run) {
  if (run.phase !== 'serving' || !hasGiven(run)) {
    return;
  }

  const given = givenOf(run);
  const { answer } = run.queue[0].question;

  if (given === answer) {
    payCustomer(run);
  } else {
    refuse(run, given, answer);
  }
}

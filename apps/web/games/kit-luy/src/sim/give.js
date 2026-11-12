import { STAGES, stageOf } from '../data/stages.js';
import { TUNING } from '../data/tuning.js';
import { sit } from './arrivals.js';
import { keepApart } from './customers.js';
import { clothCount, clothPieces, clothTotal, fewestPieces } from './pieces.js';

function extraFor(streak) {
  if (streak % TUNING.streakPerExtra !== 0) {
    return 0;
  }

  return Math.min(TUNING.mostExtraPay, (TUNING.extraPay * streak) / TUNING.streakPerExtra);
}

function rewardFor(run, answer) {
  const clean = clothCount(run.cloth) === fewestPieces(answer, run.pieces);
  const extra = extraFor(run.streak);
  const pay = STAGES[run.stage - 1].pay;
  const gain = pay + (clean ? TUNING.cleanPay : 0) + (run.tip ? TUNING.tipPay : 0) + extra;

  return { gain, clean, tip: run.tip, extra };
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

function askNext(run) {
  if (run.queue.length === 0) {
    sit(run);
  }

  run.tip = true;
  run.events.push({ type: 'ask', customer: run.queue[0] });
}

function payCustomer(run) {
  const customer = run.queue.shift();
  const pieces = clothPieces(run.cloth);

  run.streak += 1;
  run.bestStreak = Math.max(run.bestStreak, run.streak);

  const reward = rewardFor(run, customer.question.answer);

  run.takings += reward.gain;
  run.served += 1;
  run.started = true;
  run.cloth = {};
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

export function give(run) {
  if (run.phase !== 'serving' || clothCount(run.cloth) === 0) {
    return;
  }

  const given = clothTotal(run.cloth);
  const { answer } = run.queue[0].question;

  if (given === answer) {
    payCustomer(run);
  } else {
    refuse(run, given, answer);
  }
}

import { clothTotal } from '../sim/pieces.js';
import { replay } from '../ui/dom.js';

// The stamp is seen landing, then the bill is torn off and carries it away: the next customer is
// already the one being served, so their bill must not wait long behind the last one's.
const STAMP_READ_MS = 180;

// the full row is seen a moment before the shutter comes down on it
export const CLOSING_BEAT_MS = 900;

function showCount(stage) {
  const { run } = stage.game;

  stage.slip.count(run.showTotal ? clothTotal(run.cloth) : null);
}

function showCloth(stage) {
  stage.cloth.show(stage.game.run.cloth);
  showCount(stage);
}

function opened(stage) {
  const { run, records } = stage.game;

  stage.nextSlip = null;
  stage.lastDealt = [];
  stage.stools.clear();
  stage.sign.reset();
  stage.sign.showBest(records.best);
  stage.till.show(run.pieces);
  showCloth(stage);
}

function ask(stage, { customer }) {
  const wait = stage.slip.isPaid() ? STAMP_READ_MS : 0;

  stage.nextSlip = { customer, at: stage.now + wait };
}

function dealt(stage, { value }) {
  showCloth(stage);
  stage.till.pull(value);
  stage.cloth.land(value, stage.till.bundle(value));
  stage.audio.play('deal', { value });
  stage.buzz('deal');
}

function paid(stage, event) {
  const amount = event.pieces.reduce((sum, value) => sum + value, 0);

  stage.cloth.handOver(stage.at.blank);
  stage.slip.stamp({ ...event, amount });
  replay(stage.at.takings, 'is-bumped');
  stage.audio.play('stamp');
  stage.audio.play(event.extra > 0 ? 'extra' : 'paid', { pieces: event.pieces });
  stage.buzz('paid');
}

function wrong(stage, event) {
  stage.slip.refuse(event);
  stage.cloth.hop();
  stage.audio.play('wrong');
  stage.buzz('wrong');
  replay(stage.at.counter, 'is-knocked');
}

function newStage(stage, { added }) {
  stage.till.show(stage.game.run.pieces);
  stage.till.snapIn(added);
  stage.audio.play('stage');
}

function finished(stage, { summary }) {
  stage.closedAt = stage.now;
  stage.results.show(summary, stage.now + CLOSING_BEAT_MS);
  stage.save();
  stage.audio.play('closed');
  stage.buzz('closed');

  if (summary.isNewBest) {
    stage.audio.play('best');
  }
}

const HANDLERS = {
  opened,
  ask,
  deal: dealt,
  paid,
  wrong,
  finished,
  stage: newStage,

  take(stage, { value }) {
    showCloth(stage);
    stage.audio.play('take', { value });
  },

  clear(stage) {
    showCloth(stage);
    stage.audio.play('clear');
  },

  arrive: (stage, { customer }) => stage.audio.play('arrive', { kind: customer.kind }),

  left(stage, { customer }) {
    stage.stools.nextDoor(customer);
    stage.audio.play('left');
  },
};

export function present(stage, events) {
  for (const event of events) {
    HANDLERS[event.type]?.(stage, event);
  }
}

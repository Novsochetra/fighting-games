import { RIEL } from '../data/currency.js';
import { countUp } from '../lib/count-up.js';
import { piecesFor } from '../sim/pieces.js';
import { replay, setText } from './dom.js';
import { createPiece } from './piece.js';
import { answerLine } from './sum-text.js';

const COUNT_EVERY_MS = 130;
const MOST_PIECES = 12;

function missedLine(document, { question }, text) {
  const line = document.createElement('li');
  const answer = document.createElement('b');

  answer.textContent = `= ${text.number(question.answer)}`;
  line.append(answerLine(question, text), answer);

  return line;
}

// a day too good to count out in a dozen pieces is counted in its dozen largest
export const closingCount = (takings) => piecesFor(takings, RIEL.pieces).slice(0, MOST_PIECES);

const SPEEDS = ['perfect', 'great', 'good'];

function describeDay(at, summary, text) {
  const speeds = SPEEDS.filter((speed) => summary.speeds?.[speed] > 0).map(
    (speed) => `${text.t(`speed.${speed}`)} ×${text.number(summary.speeds[speed])}`,
  );
  const reason = summary.reason === 'trust' ? 'over.byTrust' : 'over.byStools';

  setText(at.overSpeeds, speeds.join('   '));
  setText(at.overReason, `${text.t(`over.mode.${summary.mode ?? 'money'}`)} · ${text.t(reason)}`);
}

export function createResultsView(at, text) {
  const document = at.overPieces.ownerDocument;
  let tally = { takings: 0, shown: 0, toCount: [], nextAt: 0 };

  return {
    show(summary, now) {
      tally = {
        takings: summary.takings,
        shown: 0,
        toCount: closingCount(summary.takings),
        nextAt: now,
      };
      describeDay(at, summary, text);
      at.overStamp.hidden = !summary.isNewBest;
      replay(at.overStamp, 'is-stamped');
      at.overPieces.replaceChildren();
      at.overMissed.replaceChildren(
        ...summary.missed.map((missed) => missedLine(document, missed, text)),
      );
      setText(
        at.overServed,
        text.t(summary.served === 1 ? 'over.servedOne' : 'over.served', {
          count: text.number(summary.served),
        }),
      );
    },

    // answers with the value counted out this frame, if any, so the page can sound it
    count(now) {
      tally.shown = countUp(tally.shown, tally.takings, RIEL.step);
      setText(at.overTakings, text.money(tally.shown));

      if (tally.toCount.length === 0 || now < tally.nextAt) {
        return null;
      }

      const value = tally.toCount.shift();

      tally.nextAt = now + COUNT_EVERY_MS;
      at.overPieces.append(createPiece(document, value, text, { small: true }));

      return value;
    },
  };
}

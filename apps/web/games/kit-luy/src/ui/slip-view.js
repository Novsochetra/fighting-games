import { replay, setText } from './dom.js';
import { createPiece } from './piece.js';
import { writeSum } from './sum-text.js';

const SERIAL_DIGITS = 4;
const TORN_OFF_MS = 560;

const serialOf = (number) => String(number).padStart(SERIAL_DIGITS, '0');

function refusal({ direction, by }, text) {
  if (by === null) {
    return text.t(direction === 'short' ? 'play.short' : 'play.over');
  }

  return text.t(direction === 'short' ? 'play.shortBy' : 'play.overBy', { amount: text.money(by) });
}

function earned({ gain, clean, tip }, text) {
  const words = [clean && text.t('play.clean'), tip && text.t('play.tip')].filter(Boolean);

  return [`+${text.money(gain)}`, ...words].join('  ');
}

function tearOff(slip) {
  const copy = slip.cloneNode(true);
  const box = slip.getBoundingClientRect();
  const window = slip.ownerDocument.defaultView;

  copy.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  copy.removeAttribute('id');
  copy.removeAttribute('aria-live');
  // only its own motion: a jolt or a refusal it was caught in would outrank the throw
  copy.className = 'slip slip-torn';
  copy.style.left = `${box.left}px`;
  copy.style.top = `${box.top}px`;
  copy.style.width = `${box.width}px`;
  slip.ownerDocument.getElementById('app').append(copy);
  window.setTimeout(() => copy.remove(), TORN_OFF_MS);
}

function writeBill(at, text, customer, number) {
  const { question } = customer;
  const document = at.slip.ownerDocument;

  at.blank.classList.remove('is-paid', 'is-extra');
  setText(at.slipAsk, text.t(`ask.${question.op}`));
  setText(at.serial, text.t('play.serial', { number: serialOf(number) }));
  setText(at.total, '');
  setText(at.mend, '');
  writeSum(at.sum, question, text);
  at.held.replaceChildren(
    ...(question.op === 'sub' ? [createPiece(document, question.left, text, { small: true })] : []),
  );
}

export function createSlipView(at, text) {
  return {
    show: (customer, number) => writeBill(at, text, customer, number),
    isPaid: () => at.blank.classList.contains('is-paid'),

    turnPage(customer, number) {
      if (at.blank.classList.contains('is-paid')) {
        tearOff(at.slip);
      }

      writeBill(at, text, customer, number);
      replay(at.slip, 'is-torn');
      replay(at.sum, 'is-written');
    },

    count(amount) {
      if (!at.blank.classList.contains('is-paid')) {
        setText(at.total, amount === null ? '' : text.number(amount));
      }
    },

    stamp(paid) {
      at.blank.classList.add('is-paid');
      at.blank.classList.toggle('is-extra', paid.extra > 0);
      setText(at.extraStamp, text.t('play.extra', { amount: text.money(paid.extra) }));
      setText(at.total, text.number(paid.amount));
      setText(at.mend, earned(paid, text));
      replay(at.mend, 'is-written');
      replay(at.slip, 'is-thumped');
    },

    refuse(wrong) {
      setText(at.mend, refusal(wrong, text));
      replay(at.mend, 'is-written');
      replay(at.slip, 'is-refused');
    },
  };
}

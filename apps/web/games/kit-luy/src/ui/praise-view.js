import { TUNING } from '../data/tuning.js';
import { replay, setText } from './dom.js';

const CHIP_GAP_MS = 110;
const CHIP_FLIGHT_MS = 760;

const centre = (element) => {
  const box = element.getBoundingClientRect();

  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

function chipOf(document, { kind, amount, word }, text) {
  const chip = document.createElement('span');
  const label = document.createElement('small');

  chip.className = 'score-chip';
  chip.dataset.kind = kind;
  label.textContent = word;
  chip.append(`+${text.number(amount)}`, label);

  return chip;
}

// what a payment earned, a chip a reason, largest first
export function chipsOf(paid, text, pay) {
  return [
    { kind: 'pay', amount: pay, word: text.t('chip.pay') },
    { kind: 'speed', amount: paid.speedPay, word: text.t('chip.speed') },
    {
      kind: 'clean',
      amount: paid.clean ? TUNING.cleanPay : 0,
      word: text.t('chip.clean'),
    },
    { kind: 'extra', amount: paid.extra, word: text.t('chip.extra') },
  ].filter((chip) => chip.amount > 0);
}

// The praise for a quick payment stamped over the customers, and its earnings carried up to the sign
// a chip at a time. Chips land on the frame clock, not on timers, so the sign's sum keeps in step
// with the frames that draw them.
export function createPraiseView(at, text) {
  const document = at.flyers.ownerDocument;
  let flying = [];

  function praise(paid) {
    // over the customers, never over the next bill, which is up the moment this one is paid
    const over = centre(at.stools);
    const seconds = text.number((paid.waitedMs / 1000).toFixed(1));

    at.praise.dataset.speed = paid.speed;
    at.praise.style.setProperty('--at-x', `${over.x}px`);
    at.praise.style.setProperty('--at-y', `${over.y}px`);
    setText(at.praiseWord, text.t(`speed.${paid.speed}`));
    setText(at.praiseTime, text.t('play.seconds', { seconds }));
    replay(at.praise, 'is-shown');
  }

  function fly(chips, now) {
    // they burst out of the praise over the customers, so no chip ever covers the next bill
    const from = centre(at.stools);
    const to = centre(at.takings);

    chips.forEach((spec, i) => {
      const chip = chipOf(document, spec, text);

      chip.style.setProperty('--from-x', `${from.x - 150 + i * 90}px`);
      chip.style.setProperty('--from-y', `${from.y + 20}px`);
      chip.style.setProperty('--to-x', `${to.x - 30}px`);
      chip.style.setProperty('--to-y', `${to.y - 10}px`);
      chip.style.animationDelay = `${i * CHIP_GAP_MS}ms`;
      at.flyers.append(chip);
      flying.push({ chip, spec, at: now + CHIP_FLIGHT_MS + i * CHIP_GAP_MS });
    });
  }

  // the chips that reach the sign by `now`, taken off the page
  function land(now) {
    const landed = flying.filter((flight) => flight.at <= now);

    flying = flying.filter((flight) => flight.at > now);
    landed.forEach((flight) => flight.chip.remove());

    return landed.map((flight) => flight.spec);
  }

  function clear() {
    flying.forEach((flight) => flight.chip.remove());
    flying = [];
  }

  return { praise, fly, land, clear };
}

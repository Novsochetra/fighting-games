import { TUNING } from '../data/tuning.js';
import { replay, setText } from './dom.js';

const CHIP_GAP_MS = 110;
const CHIP_FLIGHT_MS = 760;
const CHIP_SPACE_PX = 6;
const CHIP_ABOVE_PX = 80;
const CHIP_ROOM_PX = 40;
const PRAISE_MS = 1100;

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

export function rowLefts(widths, middle) {
  const row = widths.reduce((sum, width) => sum + width, 0) + CHIP_SPACE_PX * (widths.length - 1);
  let left = middle - row / 2;

  return widths.map((width) => {
    const start = left;

    left += width + CHIP_SPACE_PX;

    return start;
  });
}

export function chipsOf(paid, text) {
  return [
    { kind: 'pay', amount: paid.pay, word: text.t('chip.pay') },
    { kind: 'speed', amount: paid.speedPay, word: text.t('chip.speed') },
    {
      kind: 'clean',
      amount: paid.clean ? TUNING.cleanPay : 0,
      word: text.t('chip.clean'),
    },
    { kind: 'extra', amount: paid.extra, word: text.t('chip.extra') },
  ].filter((chip) => chip.amount > 0);
}

function stampPraise(at, text) {
  let shownUntil = -Infinity;

  // gone on the frame clock, as reduced motion has no animation to fade it
  const fade = (now) => {
    if (now >= shownUntil) {
      at.praise.classList.remove('is-shown');
    }
  };

  return {
    fade,

    praise(paid, now) {
      // over the customers, never over the next bill, which is up the moment this one is paid
      const over = centre(at.stools);
      const seconds = text.number((paid.waitedMs / 1000).toFixed(1));

      at.praise.dataset.speed = paid.speed;
      at.praise.style.setProperty('--at-x', `${over.x}px`);
      at.praise.style.setProperty('--at-y', `${over.y}px`);
      setText(at.praiseWord, text.t(`speed.${paid.speed}`));
      setText(at.praiseTime, text.t('play.seconds', { seconds }));
      replay(at.praise, 'is-shown');
      shownUntil = now + PRAISE_MS;
    },

    hide() {
      shownUntil = -Infinity;
      fade(0);
    },
  };
}

function aim(chip, from, to, i) {
  chip.style.setProperty('--from-x', `${from.x}px`);
  chip.style.setProperty('--from-y', `${from.y}px`);
  chip.style.setProperty('--to-x', `${to.x - 30}px`);
  chip.style.setProperty('--to-y', `${to.y - 10}px`);
  chip.style.animationDelay = `${i * CHIP_GAP_MS}ms`;
}

// a row above the praise, up toward the sign, so it hides neither the word nor the next bill
function launch(at, chips) {
  const over = centre(at.stools);
  const top = Math.max(over.y - CHIP_ABOVE_PX, CHIP_ROOM_PX);
  const to = centre(at.takings);

  at.flyers.append(...chips);

  const lefts = rowLefts(
    chips.map((chip) => chip.getBoundingClientRect().width),
    over.x,
  );

  chips.forEach((chip, i) => aim(chip, { x: lefts[i], y: top }, to, i));
}

function flyChips(at, text) {
  const document = at.flyers.ownerDocument;
  let flying = [];

  return {
    fly(specs, now) {
      const chips = specs.map((spec) => chipOf(document, spec, text));

      launch(at, chips);
      chips.forEach((chip, i) => {
        flying.push({ chip, spec: specs[i], at: now + CHIP_FLIGHT_MS + i * CHIP_GAP_MS });
      });
    },

    land(now) {
      const landed = flying.filter((flight) => flight.at <= now);

      flying = flying.filter((flight) => flight.at > now);
      landed.forEach((flight) => flight.chip.remove());

      return landed.map((flight) => flight.spec);
    },

    clear() {
      flying.forEach((flight) => flight.chip.remove());
      flying = [];
    },
  };
}

// The praise for a quick payment stamped over the customers, and its earnings carried up to the sign
// a chip at a time. Chips land on the frame clock, not on timers, so the sign's sum keeps in step
// with the frames that draw them.
export function createPraiseView(at, text) {
  const stamp = stampPraise(at, text);
  const chips = flyChips(at, text);

  return {
    praise: stamp.praise,
    fade: stamp.fade,
    fly: chips.fly,
    land: chips.land,

    clear() {
      chips.clear();
      stamp.hide();
    },
  };
}

import { WORD_RAMPS } from '../../../../../../src/art/duel/palette.js';
import { createPen } from '../../../../../../src/render/duel/pen.js';
import { RESULT_WORDS } from '../../../../../../src/render/duel/words.js';
import { moveOf } from '../../../../../../src/data/moves.js';
import { textOf } from '../../../../../../src/render/text.js';
import { drawSlamWord, drawUnderLine, WORD_UNIT } from './word.js';

const NAME = moveOf('naga-shot').name;

// the name comes up once the Naga is lit and whole, and is gone before the boot meets the ball
const NAMED = { from: 0.6, to: 0.97 };

const nameWord = () => ({ lines: [textOf(NAME, 'en').toUpperCase()], ramp: WORD_RAMPS.jade });

// a save of either kind is SAVED!, as the duel calls it; the Naga's own goal is in its jade
const RESULTS = {
  goal: { ...RESULT_WORDS.goal, ramp: 'jade' },
  catch: RESULT_WORDS.saved,
  punch: { ...RESULT_WORDS.saved, km: 'ចាំទីបាន!' },
  parry: RESULT_WORDS.parried,
  post: { lines: ['OFF THE BAR!'], km: 'បុកបង្គោល!', ramp: 'gold' },
};

const WORD_SHOWN = { from: 4, to: 0.82 };

function drawMoveName(pen, { clock, lang }) {
  const from = Math.round(NAMED.from * clock.length);
  const to = Math.round(NAMED.to * clock.length);
  const ticks = clock.ticks - from;

  if (ticks < 0 || clock.ticks >= to) {
    return;
  }

  const khmer = lang === 'km';
  const word = nameWord();
  const left = to - clock.ticks;
  const shown = drawSlamWord(pen, { word, ticks, left, top: 97, most: 3, under: khmer ? 13 : 0 });

  if (shown && khmer) {
    drawUnderLine(pen, {
      text: textOf(NAME, 'km'),
      top: shown.bottom - 1,
      shift: shown.shift,
      color: word.ramp[1],
      size: 32,
    });
  }
}

function drawResultWord(pen, { clock, ending, lang }) {
  const entry = RESULTS[ending];
  const to = Math.round(WORD_SHOWN.to * clock.length);
  const ticks = clock.ticks - WORD_SHOWN.from;

  if (!entry || ticks < 0 || clock.ticks >= to) {
    return;
  }

  const word = { lines: entry.lines, ramp: WORD_RAMPS[entry.ramp] };
  const khmer = lang === 'km';
  const left = to - clock.ticks;
  const shown = drawSlamWord(pen, { word, ticks, left, top: 46, most: 5, under: khmer ? 11 : 0 });

  if (shown && khmer) {
    drawUnderLine(pen, {
      text: entry.km,
      top: shown.bottom,
      shift: shown.shift,
      color: word.ramp[1],
    });
  }
}

const TITLES = { manifest: drawMoveName, aftermath: drawResultWord };

export function drawShotTitles(context, moment) {
  TITLES[moment.clock.stage]?.(createPen(context, { unit: WORD_UNIT }), moment);
}

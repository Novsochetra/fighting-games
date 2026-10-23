import {
  CARD_DROP_TICKS,
  CARD_HIT_TICK,
  CARD_HOT_TICKS,
  CARD_STAGGER,
  cardDoneAt,
} from '../../data/mission-handoff.js';
import { easeOutBack } from '../../lib/math.js';

const DROP_HEIGHT = 36;
const SHINE_SPEED = 9;
const SHINE_PERIOD = 60;
const TYPE_TICKS = 2;

// one letter `age` ticks into its card: each falls in after the one before, strikes its place,
// bounces and stays white from the stamp a moment after it settles
export function letterAt(age, index) {
  const since = age - index * CARD_STAGGER;
  if (since < 0) {
    return null;
  }
  const drop = Math.min(1, since / CARD_DROP_TICKS);
  return {
    offset: Math.round((easeOutBack(drop) - 1) * DROP_HEIGHT),
    hot: since < CARD_DROP_TICKS + CARD_HOT_TICKS,
    sinceHit: since - CARD_HIT_TICK,
  };
}

// how far a band of light has run over the card: it runs once every letter is down, then again
// every so often; null before that
export function shineAt(age, letterCount) {
  const since = age - cardDoneAt(letterCount);
  return since < 0 ? null : (since % SHINE_PERIOD) * SHINE_SPEED;
}

// how much of the line under the title is typed out
export function typedLength(age, letterCount) {
  return Math.max(0, Math.floor((age - cardDoneAt(letterCount)) / TYPE_TICKS));
}

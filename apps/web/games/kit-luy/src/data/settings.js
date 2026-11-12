import { OPERATIONS } from './operations.js';

const LANGUAGES = ['km', 'en'];
const NUMERALS = ['khmer', 'latin'];

export function defaultSettings(languages = []) {
  const speaksKhmer = languages.some((language) => language.toLowerCase().startsWith('km'));

  return {
    sound: true,
    music: true,
    vibrate: true,
    lang: speaksKhmer ? 'km' : 'en',
    numerals: speaksKhmer ? 'khmer' : 'latin',
    ops: [...OPERATIONS],
  };
}

const oneOf = (list, value, fallback) => (list.includes(value) ? value : fallback);
const flag = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

function savedOps(value, fallback) {
  const ops = Array.isArray(value) ? OPERATIONS.filter((op) => value.includes(op)) : [];

  return ops.length > 0 ? ops : fallback;
}

export function sanitizeSettings(saved, defaults) {
  const from = saved && typeof saved === 'object' ? saved : {};

  return {
    sound: flag(from.sound, defaults.sound),
    music: flag(from.music, defaults.music),
    vibrate: flag(from.vibrate, defaults.vibrate),
    lang: oneOf(LANGUAGES, from.lang, defaults.lang),
    numerals: oneOf(NUMERALS, from.numerals, defaults.numerals),
    ops: savedOps(from.ops, defaults.ops),
  };
}

// a run needs something to ask, so the last sum left on stays on
export function toggledOps(ops, op) {
  const next = ops.includes(op) ? ops.filter((kept) => kept !== op) : [...ops, op];

  return next.length > 0 ? OPERATIONS.filter((kept) => next.includes(kept)) : ops;
}

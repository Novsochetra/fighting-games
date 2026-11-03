import { numberIn, textOf } from '../../render/text.js';
import { HELP_STRINGS } from './strings-help.js';
import { MATCH_STRINGS } from './strings-match.js';
import { MENU_STRINGS } from './strings-menus.js';

export const LANGS = ['en', 'km'];

const PAIRS = { ...MENU_STRINGS, ...MATCH_STRINGS, ...HELP_STRINGS };

export const STRINGS = Object.freeze(
  Object.fromEntries(Object.entries(PAIRS).map(([key, [en, km]]) => [key, { en, km }])),
);

export const textIn = (value, lang) => textOf(value, lang);

// a key with no text shows itself, so a missing string is plain to see on the screen
export const say = (key, lang) => textOf(STRINGS[key], lang) || key;

export { numberIn };

const valueIn = (value, lang) =>
  typeof value === 'number' ? numberIn(value, lang) : textOf(value, lang);

// `{name}` in a string takes the value of that name: a number in the language's digits, or a text
export const sayWith = (key, lang, values = {}) =>
  say(key, lang).replace(/\{(\w+)\}/g, (_, name) => valueIn(values[name] ?? '', lang));

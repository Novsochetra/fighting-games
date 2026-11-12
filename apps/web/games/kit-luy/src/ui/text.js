import { RIEL } from '../data/currency.js';
import { EN } from '../data/strings/en.js';
import { KM } from '../data/strings/km.js';
import { TUNING } from '../data/tuning.js';
import { formatMoney, formatNumber } from '../lib/numerals.js';

const TABLES = { en: EN, km: KM };

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');

export function createText(settings) {
  const number = (value) => formatNumber(value, settings.numerals);

  return {
    number,
    money: (amount) => formatMoney(amount, settings.numerals, RIEL),
    t: (key, values = {}) => fill(TABLES[settings.lang][key] ?? EN[key] ?? key, values),
  };
}

const rulesIn = (text) => ({
  seconds: text.number(TUNING.wrongPenaltyMs / 1000),
  combo: text.number(TUNING.maxCombo),
});

export function applyText(root, text) {
  const values = rulesIn(text);

  for (const element of root.querySelectorAll('[data-i18n]')) {
    element.textContent = text.t(element.dataset.i18n, values);
  }

  for (const element of root.querySelectorAll('[data-i18n-label]')) {
    element.setAttribute('aria-label', text.t(element.dataset.i18nLabel, values));
  }
}

import { RIEL } from '../data/currency.js';
import { EN } from '../data/strings/en.js';
import { KM } from '../data/strings/km.js';
import { formatMoney, formatNumber, toKhmerDigits } from '../lib/numerals.js';

const TABLES = { en: EN, km: KM };

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');

// `settings` is read on every call, so a change of language or numerals takes on the next word
export function createText(settings) {
  return {
    number: (value) => formatNumber(value, settings.numerals),
    money: (amount) => formatMoney(amount, settings.numerals, RIEL),
    digits: (figures) => (settings.numerals === 'khmer' ? toKhmerDigits(figures) : figures),
    t: (key, values = {}) => fill(TABLES[settings.lang][key] ?? EN[key] ?? key, values),
  };
}

export function applyText(root, text) {
  for (const element of root.querySelectorAll('[data-i18n]')) {
    element.textContent = text.t(element.dataset.i18n);
  }

  for (const element of root.querySelectorAll('[data-i18n-label]')) {
    element.setAttribute('aria-label', text.t(element.dataset.i18nLabel));
  }
}

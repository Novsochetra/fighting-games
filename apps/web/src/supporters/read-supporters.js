export const ANONYMOUS = 'Anonymous';
export const DEFAULT_CURRENCY = 'USD';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const CURRENCY_CODE = /^[A-Z]{3}$/;

const trimmed = (value) => (typeof value === 'string' ? value.trim() : '');

function readSupporter(entry) {
  const amount = Number(entry?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  const name = trimmed(entry.name);
  const day = trimmed(entry.date);
  return {
    name: name || ANONYMOUS,
    isAnonymous: name === '',
    amount,
    date: ISO_DAY.test(day) ? day : '',
    message: trimmed(entry.message),
  };
}

export function readSupporters(payload) {
  const currency = trimmed(payload?.currency).toUpperCase();
  const entries = Array.isArray(payload?.supporters) ? payload.supporters : [];
  return {
    currency: CURRENCY_CODE.test(currency) ? currency : DEFAULT_CURRENCY,
    supporters: entries.map(readSupporter).filter(Boolean),
  };
}

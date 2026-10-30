// The donate sheet holds the same limits
// (apps/web/arcade/src/screens/supporters/donate/donate-form.js); a test keeps them equal.
export const DONATION_LIMITS = {
  nameLength: 40,
  messageLength: 140,
  minAmount: 0.01,
  maxAmount: 10000,
};

const CONTROL_CHARACTERS = /\p{Cc}/gu;

function clean(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(CONTROL_CHARACTERS, ' ').replace(/\s+/g, ' ').trim();
}

// Postgres counts characters by code point, as the spread does, and a Khmer name has many.
const lengthOf = (text) => [...text].length;

export function toCents(value) {
  const amount = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return null;
  }
  const cents = Math.round(amount * 100);
  const hasMoreDecimals = Math.abs(cents - amount * 100) > 1e-6;
  const { minAmount, maxAmount } = DONATION_LIMITS;
  if (hasMoreDecimals || cents < minAmount * 100 || cents > maxAmount * 100) {
    return null;
  }
  return cents;
}

export function readDonation(body) {
  const { nameLength, messageLength, minAmount, maxAmount } = DONATION_LIMITS;
  const name = clean(body?.name);
  const message = clean(body?.message);
  const amountCents = toCents(body?.amount);
  if (amountCents === null) {
    return {
      error: `The amount must be from $${minAmount} to $${maxAmount}, in dollars and cents.`,
    };
  }
  if (lengthOf(name) > nameLength) {
    return { error: `The name can be at most ${nameLength} characters.` };
  }
  if (lengthOf(message) > messageLength) {
    return { error: `The message can be at most ${messageLength} characters.` };
  }
  return { donation: { name, amountCents, message } };
}

// The server holds the same limits (apps/server/src/supporters/read-donation.js) and its check is
// the one that counts; this one only spares a trip there. A test keeps the two equal.
export const DONATION_LIMITS = {
  nameLength: 40,
  messageLength: 140,
  minAmount: 1,
  maxAmount: 10000,
};

export const QUICK_AMOUNTS = [1, 5, 10, 25];

const DOLLARS_AND_CENTS = /^\d+(\.\d{1,2})?$/;

const squeeze = (text) =>
  String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();

const lengthOf = (text) => [...text].length;

export function readAmount(text) {
  const typed = squeeze(text)
    .replace(/^\$\s*/, '')
    .replace(/,/g, '');
  if (!DOLLARS_AND_CENTS.test(typed)) {
    return null;
  }
  const amount = Number(typed);
  const { minAmount, maxAmount } = DONATION_LIMITS;
  return amount >= minAmount && amount <= maxAmount ? amount : null;
}

export function readDonationForm({ name, amount, message }) {
  const { nameLength, messageLength, minAmount, maxAmount } = DONATION_LIMITS;
  const donation = { name: squeeze(name), amount: readAmount(amount), message: squeeze(message) };
  if (donation.amount === null) {
    const most = maxAmount.toLocaleString('en-US');
    return { field: 'amount', error: `Enter an amount from $${minAmount} to $${most}.` };
  }
  if (lengthOf(donation.name) > nameLength) {
    return { field: 'name', error: `Keep the name to ${nameLength} characters.` };
  }
  if (lengthOf(donation.message) > messageLength) {
    return { field: 'message', error: `Keep the message to ${messageLength} characters.` };
  }
  return { donation };
}

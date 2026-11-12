const KHMER_DIGITS = '០១២៣៤៥៦៧៨៩';

export const grouped = (value) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const toKhmerDigits = (text) => text.replace(/\d/g, (digit) => KHMER_DIGITS[digit]);

export function formatNumber(value, numerals) {
  const text = grouped(value);

  return numerals === 'khmer' ? toKhmerDigits(text) : text;
}

export const formatMoney = (amount, numerals, currency) =>
  `${formatNumber(amount, numerals)}${currency.symbol}`;

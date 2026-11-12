import { COUNTS_BY, SIGNS } from '../data/operations.js';

const SHORT_SUM = 13;
const MEDIUM_SUM = 16;

export function sumText(question, text) {
  const right = COUNTS_BY[question.op] ? text.number(question.right) : text.money(question.right);

  return `${text.money(question.left)} ${SIGNS[question.op]} ${right}`;
}

// a note holds 13 Khmer digits and signs across at full size; a longer sum is set smaller
export function sumSize(sum) {
  if (sum.length <= SHORT_SUM) {
    return 'short';
  }

  return sum.length <= MEDIUM_SUM ? 'medium' : 'long';
}

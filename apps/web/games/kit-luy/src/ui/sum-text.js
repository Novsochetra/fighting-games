import { SIGNS } from '../data/operations.js';

const LONG_SUM = 13;
const COUNTED = { mul: true, div: true };

// a bill is written without the riel sign, as a seller writes one; the sign follows the blank
export function sumParts(question, text) {
  const right = COUNTED[question.op]
    ? text.digits(String(question.right))
    : text.number(question.right);

  return { left: text.number(question.left), sign: SIGNS[question.op], right };
}

export const sumSize = ({ left, right }) =>
  left.length + right.length + 3 > LONG_SUM ? 'long' : 'short';

export function writeSum(element, question, text) {
  const parts = sumParts(question, text);
  const sign = element.ownerDocument.createElement('span');

  sign.className = 'sign-of';
  sign.textContent = parts.sign;
  element.dataset.size = sumSize(parts);
  element.replaceChildren(parts.left, sign, parts.right);
}

export const answerLine = (question, text) => {
  const { left, sign, right } = sumParts(question, text);

  return `${left} ${sign} ${right}`;
};

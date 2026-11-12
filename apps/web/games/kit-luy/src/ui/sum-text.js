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
  element.style.fontSize = '';
  element.replaceChildren(parts.left, sign, parts.right);
  shrinkToFit(element);
}

// the size tiers go by how many figures a sum has, but a hand's figures differ in width: a sum
// that still runs past the paper comes down until it fits
function shrinkToFit(element) {
  const room = element.clientWidth;
  const needed = element.scrollWidth;

  if (room > 0 && needed > room) {
    const size = parseFloat(element.ownerDocument.defaultView.getComputedStyle(element).fontSize);

    element.style.fontSize = `${Math.floor((size * room) / needed)}px`;
  }
}

export const answerLine = (question, text) => {
  const { left, sign, right } = sumParts(question, text);

  return `${left} ${sign} ${right}`;
};

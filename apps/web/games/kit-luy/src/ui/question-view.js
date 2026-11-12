import { SIGNS } from '../data/operations.js';
import { replay, setText } from './dom.js';
import { sumSize, sumText } from './sum-text.js';

const MARKS = ['is-right', 'is-wrong', 'is-answer', 'is-dim'];

function wrongMark(i, { index, correctIndex }) {
  if (i === index) {
    return 'is-wrong';
  }

  return i === correctIndex ? 'is-answer' : 'is-dim';
}

export function createQuestionView({ note, caption, sum, answers }) {
  const keys = [...answers.querySelectorAll('.answer')];
  const sign = note.querySelector('.note-sign');
  const clear = () => keys.forEach((key) => key.classList.remove(...MARKS));

  return {
    keys,

    blank() {
      clear();
      note.dataset.op = '';
      setText(sign, '');
      setText(caption, '');
      setText(sum, '?');
      keys.forEach((key) => setText(key.lastElementChild, ''));
    },

    show(question, text) {
      const written = sumText(question, text);

      clear();
      note.dataset.op = question.op;
      sum.dataset.size = sumSize(written);
      setText(sign, SIGNS[question.op]);
      setText(caption, text.t(`caption.${question.op}`));
      setText(sum, written);
      keys.forEach((key, i) => setText(key.lastElementChild, text.money(question.choices[i])));
    },

    deal() {
      replay(note, 'is-dealt');
      keys.forEach((key) => replay(key, 'is-dealt'));
    },

    markRight(index) {
      keys[index].classList.remove('is-dealt');
      keys[index].classList.add('is-right');
    },

    markWrong(answer) {
      keys.forEach((key, i) => {
        key.classList.remove('is-dealt');
        key.classList.add(wrongMark(i, answer));
      });
    },
  };
}

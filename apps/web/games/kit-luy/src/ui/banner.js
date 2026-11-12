import { replay, setText } from './dom.js';

export function createBanner(element) {
  return function announce(text, kind) {
    element.dataset.kind = kind;
    setText(element, text);
    replay(element, 'is-shown');
  };
}

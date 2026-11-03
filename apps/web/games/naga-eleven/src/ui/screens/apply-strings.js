import { say } from './strings.js';

// the page is written in English; every word that has a string names it, and is set again in the
// language picked. The page itself takes the language too, so a screen reader reads Khmer as Khmer
// and what stands outside the screens follows the Khmer type
export function applyStrings(root, lang) {
  root.lang = lang;
  root.ownerDocument.documentElement.lang = lang;

  for (const node of root.querySelectorAll('[data-text]')) {
    node.textContent = say(node.dataset.text, lang);
  }

  for (const node of root.querySelectorAll('[data-label]')) {
    node.setAttribute('aria-label', say(node.dataset.label, lang));
  }
}

// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { showTurnCard } from '../../../src/ui/turn-card.js';
import { pageRules, rulesOf, styleOf, valueOf } from '../../support/page-styles.js';

// On a Khmer page the turn card's English line, "Turn your phone sideways", came out in the Khmer
// face's Latin letters: the line set no face of its own, so it inherited the one the page worked
// out under its own lang, whatever the line's lang="en" said. A browser works `--font-ui` out on
// the element that reads it, so each line now reads it itself, under its own lang.

const matches = (node, selector) => {
  try {
    return node.matches(selector);
  } catch {
    return false;
  }
};

// the face the last rule that sets one on this very element gives it, or null when it inherits
function ownFamily(node) {
  const rules = pageRules().filter(
    (rule) =>
      !rule.at &&
      rule.selector.split(',').some((selector) => matches(node, selector.trim())) &&
      valueOf(rule.body, 'font-family'),
  );

  return rules.length ? valueOf(rules.at(-1).body, 'font-family') : null;
}

const uiFaceUnder = (selector) =>
  valueOf(
    rulesOf(styleOf('tokens.css')).find((rule) => rule.selector === selector).body,
    '--font-ui',
  );

beforeEach(() => {
  document.body.innerHTML = '';
  showTurnCard(document, true);
});

describe('the turn card’s two lines', () => {
  it('each read the UI face themselves, under their own lang', () => {
    for (const [selector, lang] of [
      ['.turn-title', 'en'],
      ['.turn-khmer', 'km'],
    ]) {
      const line = document.querySelector(selector);

      expect(line.lang, selector).toBe(lang);
      expect(ownFamily(line), selector).toBe('var(--font-ui)');
    }
  });

  it('get the pixel face in English and the Khmer face in Khmer', () => {
    expect(uiFaceUnder(':lang(en)')).toBe('var(--font-pixel)');
    expect(uiFaceUnder(':lang(km)')).toBe('var(--font-khmer)');
  });
});

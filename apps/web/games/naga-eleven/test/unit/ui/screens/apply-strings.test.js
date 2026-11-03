// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { applyStrings } from '../../../../src/ui/screens/apply-strings.js';

describe('setting the screens’ words in a language', () => {
  beforeEach(() => {
    document.documentElement.lang = 'en';
    document.body.innerHTML =
      '<div id="screens"><h2 data-text="howTo">How to play</h2><button data-label="back"></button></div>';
  });

  it('writes each word and label in it, and names the language on the page and the screens', () => {
    const root = document.getElementById('screens');

    applyStrings(root, 'km');

    expect(root.lang).toBe('km');
    expect(document.documentElement.lang).toBe('km');
    expect(root.querySelector('h2').textContent).not.toBe('How to play');
    expect(root.querySelector('button').getAttribute('aria-label')).toBeTruthy();

    applyStrings(root, 'en');

    expect(document.documentElement.lang).toBe('en');
    expect(root.querySelector('h2').textContent).toBe('How to play');
  });
});

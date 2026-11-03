// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { SETTINGS_KEY } from '../../../src/ui/screens/settings-store.js';
import { HELP_STRINGS } from '../../../src/ui/screens/strings-help.js';
import { loadPageBody } from '../../support/page-body.js';
import { rulesOf, styleOf, valueOf } from '../../support/page-styles.js';
import { fakeStorage } from '../../support/screen-fixtures.js';

// How to play in Khmer: the keys' caps (J, ENTER, RB) fell back to the Khmer face instead of the
// pixel one; the page kept lang="en"; and the Khmer sentences said SHOOT, PASS and RUN where the
// rows they point at are named ទាត់បាល់, បញ្ជូនបាល់ and រត់លឿន

const ROWS = { SHOOT: 'doShoot', PASS: 'doPass', RUN: 'doRun' };

const capRule = () => rulesOf(styleOf('options.css')).find((rule) => rule.selector === '.cap');

const pxOf = (selector, token) =>
  parseFloat(
    valueOf(rulesOf(styleOf('tokens.css')).find((rule) => rule.selector === selector).body, token),
  );

describe('How to play in Khmer', () => {
  beforeEach(async () => {
    await loadPageBody(document);
    document.documentElement.lang = 'en';
  });

  it('sets the whole page in Khmer, and back in English', () => {
    const stored = { lang: 'km', sound: 8, music: 6, matchLength: 'normal', touch: 'auto' };
    const screens = createScreens(document, {
      storage: fakeStorage({ [SETTINGS_KEY]: JSON.stringify(stored) }),
    });

    expect(document.documentElement.lang).toBe('km');

    screens.setLang('en');

    expect(document.documentElement.lang).toBe('en');
  });

  it('prints a key’s cap in the pixel face, at a size it is crisp at in both languages', () => {
    const family = valueOf(capRule().body, 'font-family');

    expect(family.indexOf('var(--font-pixel)')).toBe(0);
    expect(family).toContain('var(--font-khmer)');
    expect(valueOf(capRule().body, 'font-size')).toBe('var(--font-size-note)');

    for (const selector of [':root', ':lang(en)', ':lang(km)']) {
      expect(pxOf(selector, '--font-size-note') % 8, selector).toBe(0);
    }
  });

  it('names each control in a Khmer sentence as its row is named', () => {
    for (const [key, text] of Object.entries(HELP_STRINGS)) {
      const [english, khmer] = text;

      for (const [word, row] of Object.entries(ROWS)) {
        if (english.includes(word)) {
          expect(khmer, key).not.toContain(word);
          expect(khmer, key).toContain(HELP_STRINGS[row][1]);
        }
      }
    }
  });
});

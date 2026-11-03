// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { loadPageBody } from '../../support/page-body.js';
import { pageRules, valueOf } from '../../support/page-styles.js';
import { fakeStorage, savedAt } from '../../support/screen-fixtures.js';

// held sideways (844 x 390) the chapters cut Play and Back off in Khmer, the hero sheet and How to
// play ran 711 and 755 px tall with no sign there was more, and How to play opened again where
// it was last scrolled to; the panel's short-screen padding never applied, as panel.css loads
// after screens.css and set it back
const SHORT = 'max-height: 480px';

const lastIndexOf = (rules, test) => rules.findLastIndex(test);

const setsPadding = (rule) =>
  valueOf(rule.body, 'padding') !== null || valueOf(rule.body, '--panel-pad-top') !== null;

describe('a phone held sideways', () => {
  it('closes the panel up, after every rule that sets its padding', () => {
    const rules = pageRules().filter((rule) => rule.selector === '.panel' && setsPadding(rule));
    const short = lastIndexOf(rules, (rule) => rule.at.includes(SHORT));
    const plain = lastIndexOf(rules, (rule) => rule.at === '');

    expect(short).toBeGreaterThan(plain);
  });

  it('closes the panel’s title up, after the title’s own margin', () => {
    const rules = pageRules().filter(
      (rule) => rule.selector === '.panel-title' && valueOf(rule.body, 'margin(?:-bottom)?'),
    );

    expect(lastIndexOf(rules, (rule) => rule.at.includes(SHORT))).toBeGreaterThan(
      lastIndexOf(rules, (rule) => rule.at === ''),
    );
  });

  it('docks a panel’s buttons at the foot of a screen that scrolls', () => {
    const dock = pageRules().find(
      (rule) => rule.selector === '.is-scrollable .panel > .button-row' && rule.at === '',
    );

    expect(valueOf(dock.body, 'position')).toBe('sticky');
    expect(valueOf(dock.body, 'bottom')).toMatch(/^calc\(-1 \* var\(--screen-pad-bottom\)\)$/);
  });
});

describe('a screen taller than the phone', () => {
  let screens;

  beforeEach(async () => {
    await loadPageBody(document);
    screens = createScreens(document, { storage: fakeStorage() });
  });

  it('says there is more below until it is scrolled to its end', () => {
    const hero = document.getElementById('screen-hero');

    Object.defineProperty(hero, 'scrollHeight', { configurable: true, get: () => 711 });
    Object.defineProperty(hero, 'clientHeight', { configurable: true, get: () => 390 });
    screens.show('hero', { hero: savedAt().hero, age: 'child' });

    expect([...hero.classList]).toEqual(expect.arrayContaining(['is-scrollable', 'has-more']));

    hero.scrollTop = 321;
    hero.dispatchEvent(new Event('scroll'));

    expect(hero.classList.contains('has-more')).toBe(false);
  });

  it('opens How to play at its top again', () => {
    const howto = document.getElementById('screen-howto');

    screens.show('menu', { hasSave: false });
    screens.show('howto', { device: 'touch' });
    howto.scrollTop = 420;
    screens.back();
    screens.show('howto', { device: 'touch' });

    expect(howto.scrollTop).toBe(0);
  });
});

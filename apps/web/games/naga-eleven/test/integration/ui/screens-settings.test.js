// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { SETTINGS_KEY } from '../../../src/ui/screens/settings-store.js';
import { loadPageBody } from '../../support/page-body.js';
import { fakeStorage, SAMPLE_POSTMATCH, throwingStorage } from '../../support/screen-fixtures.js';

const valueOf = (key) =>
  document.querySelector(`#screen-settings [data-slot="${key}"]`).textContent;
const stepRow = (key, direction) =>
  document.querySelector(`#screen-settings [data-adjust="${key}"] .step-${direction}`).click();

describe('the settings', () => {
  let heard;

  beforeEach(async () => {
    await loadPageBody(document);
    heard = [];
  });

  const open = (storage) => {
    const screens = createScreens(document, {
      storage,
      onAction: (name, payload) => heard.push([name, payload]),
    });

    screens.show('settings');

    return screens;
  };

  it('starts from the defaults, and keeps each change at once', () => {
    const storage = fakeStorage();
    const screens = open(storage);

    expect(screens.settings()).toEqual({
      lang: 'en',
      sound: 8,
      music: 6,
      matchLength: 'normal',
      touch: 'auto',
    });

    stepRow('matchLength', 'on');
    stepRow('touch', 'back');
    stepRow('music', 'on');

    expect(JSON.parse(storage.store.get(SETTINGS_KEY))).toMatchObject({
      matchLength: 'short',
      touch: 'off',
      music: 7,
    });
    expect(heard).toEqual([
      ['setting', { key: 'matchLength', value: 'short' }],
      ['setting', { key: 'touch', value: 'off' }],
      ['setting', { key: 'music', value: 7 }],
    ]);
    expect(valueOf('matchLength')).toBe('Short');
    expect(valueOf('touch')).toBe('Off');
  });

  it('reads what was kept, and turns down a value it does not know', () => {
    const stored = { sound: 3, music: 42, touch: 'on', lang: 'km', matchLength: 'long' };
    const screens = open(fakeStorage({ [SETTINGS_KEY]: JSON.stringify(stored) }));

    expect(screens.settings()).toEqual({
      lang: 'km',
      sound: 3,
      music: 6,
      matchLength: 'normal',
      touch: 'on',
    });
    expect(document.getElementById('screens').lang).toBe('km');
  });

  it('plays on with the defaults when the storage throws', () => {
    const screens = open(throwingStorage);

    stepRow('sound', 'on');

    expect(screens.settings().sound).toBe(9);
    expect(heard).toEqual([['setting', { key: 'sound', value: 9 }]]);
  });

  it('plays on with no storage at all', () => {
    const screens = open(null);

    stepRow('touch', 'on');

    expect(screens.settings().touch).toBe('on');
  });

  it('turns every word to Khmer and back when the language changes', () => {
    const screens = open(fakeStorage());
    const title = document.getElementById('settings-heading');
    const back = document.querySelector('#screen-settings [data-action="back"]');

    stepRow('lang', 'on');

    expect(title.textContent).toBe('ការកំណត់');
    expect(back.textContent).toBe('ថយក្រោយ');
    expect(valueOf('lang')).toBe('ខ្មែរ');
    expect(valueOf('touch')).toBe('ស្វ័យប្រវត្តិ');
    expect(document.querySelector('#screen-menu [data-action="hero"]').textContent).toBe('វីរបុរស');
    expect(heard).toEqual([['setting', { key: 'lang', value: 'km' }]]);

    screens.setLang('en');

    expect(title.textContent).toBe('Settings');
    expect(screens.settings().lang).toBe('en');
  });

  it('keeps the focus on the language row as its words change', () => {
    const screens = open(fakeStorage());

    screens.navigate('right');

    expect(document.activeElement.dataset.adjust).toBe('lang');
  });

  it('writes numbers in Khmer digits on a Khmer screen', () => {
    const screens = open(fakeStorage());

    screens.setLang('km');
    screens.show('postmatch', SAMPLE_POSTMATCH);

    expect(document.querySelector('#screen-postmatch [data-slot="score"]').textContent).toBe(
      '២ - ១',
    );
    expect(document.querySelector('#screen-postmatch .goal-scorer').textContent).toBe('រិទ្ធី');
  });

  it('turns down a language it has no words for', () => {
    const screens = open(fakeStorage());

    screens.setLang('fr');

    expect(screens.settings().lang).toBe('en');
    expect(document.getElementById('screens').lang).toBe('en');
  });
});

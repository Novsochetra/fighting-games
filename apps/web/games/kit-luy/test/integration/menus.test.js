// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../support/open-page.js';

const rowValue = (key) => document.querySelector(`[data-setting="${key}"] b`).textContent;

describe('the stall’s shutter and its menus', () => {
  it('pulls the shutter down on Escape, the clock and the walker held, and up again', () => {
    const page = openPage();

    page.serve();

    const { elapsed } = page.game.run;

    page.typeKey('Escape');
    page.wait(5000);
    expect(page.openMenu()).toBe('m-pause');
    expect(page.game.run.elapsed).toBe(elapsed);

    page.typeKey('Escape');
    page.step();
    expect(page.openMenu()).toBeNull();
  });

  it('pauses from the pause plate, and when the tab is hidden', () => {
    const page = openPage();

    page.serve();
    page.click('.plate-pause');
    page.step();
    expect(page.view()).toBe('pause');

    page.click('#m-pause [data-act="resume"]');
    page.step();
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new window.Event('visibilitychange'));
    page.step();
    delete document.hidden;

    expect(page.view()).toBe('pause');
  });

  it('counts nothing behind the shutter', () => {
    const page = openPage();

    page.serve();
    page.typeKey('Escape');
    page.deal(1000);
    page.typeKey('Digit3');
    page.typeKey('Enter');

    expect(page.game.run.cloth).toEqual({});
  });

  it('closes for the day from the pause, back to a new title counting nothing', () => {
    const page = openPage();

    page.serve();
    page.typeKey('Escape');
    page.click('#m-pause [data-act="quit"]');
    page.step();

    expect(page.view()).toBe('title');
    expect(page.openMenu()).toBeNull();
    expect(page.game.records.money.plays).toBe(0);
  });

  it('opens Settings and How to play over the title, and Back or Escape closes them', () => {
    const page = openPage();

    page.click('#app [data-act="settings"]');
    expect(page.openMenu()).toBe('m-settings');

    page.click('#m-settings [data-act="back"]');
    expect(page.openMenu()).toBeNull();

    page.click('#app [data-act="help"]');
    page.typeKey('Escape');
    expect(page.openMenu()).toBeNull();
    expect(page.view()).toBe('title');
  });

  it('says the whole page again in Khmer when the language changes, and keeps the choice', () => {
    const page = openPage();

    page.click('#app [data-act="settings"]');
    page.click('[data-setting="lang"]');

    expect(rowValue('lang')).toBe('ខ្មែរ');
    expect(document.documentElement.lang).toBe('km');
    expect(document.getElementById('settingsTitle').textContent).toBe('ការកំណត់');
    expect(page.text('slipAsk')).toBe('ទាំងអស់ប៉ុន្មាន?');
    expect(page.saved().settings.lang).toBe('km');
  });

  it('writes the money and the bill again in the numerals just chosen', () => {
    const page = openPage();

    page.click('#app [data-act="settings"]');
    page.click('[data-setting="numerals"]');

    expect(page.text('sum')).toBe('៥០០+៥០០');
    expect(document.querySelector('.bundle[data-value="1000"] .piece').textContent).toBe('១០០០');
  });

  it.each([
    ['always', 'Always', true],
    ['early', 'At first', false],
  ])('pencils the total on the third stage’s bills only if set to %s', (_value, label, shown) => {
    const page = openPage({ settings: { total: _value } });

    page.click('#app [data-act="settings"]');
    expect(rowValue('total')).toBe(label);
    page.click('#m-settings [data-act="back"]');

    while (page.game.run.stage < 3) {
      page.serve();
    }

    page.deal(500);
    page.step();
    expect(page.text('total')).toBe(shown ? '500' : '');
  });

  it('takes a sum out of the mix and opens the stall afresh with what is left', () => {
    const page = openPage();
    const chip = (op) => document.querySelector(`.chip[data-op="${op}"]`);

    page.click('#app [data-act="settings"]');

    for (const op of ['add', 'sub', 'mul']) {
      chip(op).click();
    }

    expect(page.game.settings.ops).toEqual(['div']);
    expect(chip('div').getAttribute('aria-pressed')).toBe('true');
    expect(chip('add').getAttribute('aria-pressed')).toBe('false');
    expect(page.game.run.queue[0].question.op).toBe('div');
  });
});

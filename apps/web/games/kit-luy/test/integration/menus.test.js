// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../support/open-page.js';

const rowValue = (key) => document.querySelector(`[data-setting="${key}"] b`).textContent;

describe('the game’s menus', () => {
  it('pauses on Escape with the board covered, and goes on with Escape', () => {
    const page = openPage();

    page.play();

    const { timeLeft } = page.game.run;

    page.typeKey('Escape');
    page.wait(3000);
    expect(page.screen()).toBe('pause');
    expect(page.openMenu()).toBe('m-pause');
    expect(page.game.run.timeLeft).toBe(timeLeft);

    page.typeKey('Escape');
    page.step();
    expect(page.screen()).toBe('play');
    expect(page.openMenu()).toBeNull();
  });

  it('pauses from the pause button, and when the tab is hidden', () => {
    const page = openPage();

    page.play();
    page.click('.hud-pause');
    page.step();
    expect(page.screen()).toBe('pause');

    page.click('#m-pause [data-act="resume"]');
    page.step();
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new window.Event('visibilitychange'));
    page.step();
    delete document.hidden;

    expect(page.screen()).toBe('pause');
  });

  it('takes no answer while paused', () => {
    const page = openPage();

    page.play();
    page.typeKey('Escape');
    page.pressRight();
    page.typeKey('Digit1');

    expect(page.game.run).toMatchObject({ correct: 0, wrong: 0 });
  });

  it('quits to the title without counting the run', () => {
    const page = openPage();

    page.play();
    page.pressRight();
    page.typeKey('Escape');
    page.click('#m-pause [data-act="quit"]');
    page.step();

    expect(page.screen()).toBe('title');
    expect(page.text('titleSavings')).toBe('0៛');
  });

  it('opens Settings over the title and steps back out with Back or Escape', () => {
    const page = openPage();

    page.click('#m-title [data-act="settings"]');
    expect(page.openMenu()).toBe('m-settings');

    page.click('#m-settings [data-act="back"]');
    expect(page.openMenu()).toBe('m-title');

    page.click('#m-title [data-act="help"]');
    page.typeKey('Escape');
    expect(page.openMenu()).toBe('m-title');
    expect(page.screen()).toBe('title');
  });

  it('says the whole page again in Khmer when the language changes, and keeps the choice', () => {
    const page = openPage();

    page.click('#m-title [data-act="settings"]');
    expect(rowValue('lang')).toBe('English');

    page.click('[data-setting="lang"]');

    expect(rowValue('lang')).toBe('ខ្មែរ');
    expect(document.documentElement.lang).toBe('km');
    expect(document.querySelector('#settingsTitle').textContent).toBe('ការកំណត់');
    expect(document.querySelector('[data-setting="sound"] span').textContent).toBe('សំឡេង');
    expect(document.querySelector('.hud-pause').getAttribute('aria-label')).toBe('ផ្អាក');
    expect(page.saved().settings.lang).toBe('km');
  });

  it('writes the question a pause covers again in the numerals just chosen', () => {
    const page = openPage();

    page.play();
    page.typeKey('Escape');
    page.click('#m-pause [data-act="settings"]');
    page.click('[data-setting="numerals"]');

    expect(page.text('sum')).toMatch(/^[០-៩,]+៛ [+−×÷] [០-៩,]+៛?$/);
    expect(page.text('titleBest')).toBe('០៛');
  });

  it('keeps a question the countdown hides hidden through a change of settings', () => {
    const page = openPage();

    page.click('#m-title [data-act="play"]');
    page.step();
    page.typeKey('Escape');
    page.click('#m-pause [data-act="settings"]');
    page.click('[data-setting="numerals"]');

    expect(page.text('sum')).toBe('?');
  });

  it('turns the sound off and back on from its row', () => {
    const page = openPage();

    page.click('#m-title [data-act="settings"]');
    page.click('[data-setting="sound"]');
    expect(rowValue('sound')).toBe('Off');
    expect(page.game.settings.sound).toBe(false);

    page.click('[data-setting="sound"]');
    expect(rowValue('sound')).toBe('On');
  });

  it('takes a sum out of the mix from the title, down to the last one', () => {
    const page = openPage();
    const chip = (op) => document.querySelector(`.chip[data-op="${op}"]`);

    for (const op of ['add', 'sub', 'mul', 'div']) {
      chip(op).click();
    }

    expect(page.game.settings.ops).toEqual(['div']);
    expect(chip('div').getAttribute('aria-pressed')).toBe('true');
    expect(chip('add').getAttribute('aria-pressed')).toBe('false');
    expect(page.saved().settings.ops).toEqual(['div']);

    page.play();
    expect(page.game.run.question.op).toBe('div');
  });

  it('gives the open menu’s first choice the focus, for a keyboard', () => {
    const page = openPage();

    expect(document.activeElement.dataset.act).toBe('play');

    page.play();
    page.typeKey('Escape');
    page.step();
    expect(document.activeElement.dataset.act).toBe('resume');
  });
});

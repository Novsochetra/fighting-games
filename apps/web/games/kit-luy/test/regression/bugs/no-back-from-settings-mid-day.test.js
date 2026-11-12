// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

const SIGN_CSS = readFileSync(join(import.meta.dirname, '../../../styles/sign.css'), 'utf8');

// The rule hiding the sign's Help, Settings and Arcade plates through a day hid every plate,
// the sheets' Back among them: Settings opened from the pause had no way back on a phone.
describe('Settings opened from the pause', () => {
  it('keeps its Back button', () => {
    const page = openPage();
    const style = document.createElement('style');

    style.textContent = SIGN_CSS;
    document.head.append(style);
    page.serve();
    page.typeKey('Escape');
    page.step();
    page.click('#m-pause [data-act="settings"]');
    page.step();

    const back = document.querySelector('#m-settings [data-act="back"]');

    expect(page.view()).toBe('pause');
    expect(window.getComputedStyle(back).display).not.toBe('none');
    expect(
      window.getComputedStyle(document.querySelector('.plates [data-act="help"]')).display,
    ).toBe('none');
    style.remove();
  });
});

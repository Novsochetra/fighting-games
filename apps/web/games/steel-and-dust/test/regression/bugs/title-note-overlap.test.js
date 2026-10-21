import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { titleNoteHtml } from '../../../src/ui/menus/menu-text.js';

// Bug: on an upright phone the title's note ran into "turn your phone sideways". The carved menus
// made every child of the title `position: relative`, which beat the hint's `position: absolute`,
// so the hint fell into the column and its bottom offset pulled it up onto the note; the records
// also broke inside "59 / hits".
const STYLES = new URL('../../../styles/', import.meta.url);
const css = (name) => readFileSync(new URL(name, STYLES), 'utf8');

const context = {
  ui: { isTouchOn: () => true },
  fullscreen: { supported: false },
  isIos: true,
  padConnected: false,
};

describe('the title note on an upright phone', () => {
  it('keeps the rotate hint in the column under the note', () => {
    const hint = css('touch.css').match(/body\.touch-on \.rotate \{([^}]*)\}/)[1];
    expect(hint).not.toMatch(/position: absolute/);
    expect(hint).not.toMatch(/bottom:/);
    expect(css('stone-menus.css')).not.toMatch(/#m-title > \*/);
  });

  it('keeps each record whole so the line breaks between them', () => {
    const game = { records: { bestScore: 143131, bestCombo: 59 } };
    const html = titleNoteHtml(game, context);
    expect(html).toContain('<span class="keep">Best score <b>143131</b></span>');
    expect(html).toContain('<span class="keep">Best combo <b>59 hits</b></span>');
    expect(html).toContain('Home Screen');
  });
});

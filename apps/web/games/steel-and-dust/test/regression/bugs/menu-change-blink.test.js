// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/menu-page.js';

// Bug: moving between menus blinked. A menu went from `display: none` to shown and faded in from
// nothing, while the one it replaced vanished at once, and each menu carried its own backdrop, so
// for a moment the bare game screen showed between the title and Settings, and the Angkor painting
// went out and came back between the title and the hero select (moved 6px as it came).
// happy-dom swaps the global URL for one that ignores file: bases, so the path is joined by hand
const css = (name) => readFileSync(join(import.meta.dirname, '../../../styles', name), 'utf8');
const rule = (source, selector) =>
  source.match(new RegExp(`(^|\\n)${selector.replace(/[.[\]]/g, '\\$&')} \\{([^}]*)\\}`))?.[2];

describe('a change of menu', () => {
  it('fades the menus over each other instead of switching them on and off', () => {
    const menu = rule(css('menus.css'), '.menu');
    expect(menu).toMatch(/display: flex;/);
    expect(menu).toMatch(/visibility: hidden;/);
    expect(menu).toMatch(/transition:/);
    expect(menu).not.toMatch(/background/);
  });

  it('paints the Angkor scene once, behind every menu, not on each menu', () => {
    const scene = css('hero-scene.css');
    expect(rule(scene, '.menu-scene')).toMatch(/bg-landscape\.png/);
    expect(scene).not.toMatch(/#m-title,\s*\.menu\.heroes \{[^}]*background/);
  });

  it('keeps the painting up while Settings opens over the title', () => {
    const page = openPage();
    page.act('settings');
    expect(document.getElementById('menus').dataset.scene).toBe('on');
  });
});

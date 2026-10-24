import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../../src/home/escape-html.js';
import { EAGER_ICON_COUNT, renderAppGrid, renderAppIcon } from '../../../src/home/render-app.js';

const card = (overrides = {}) => ({
  id: 'steel-and-dust',
  title: 'Steel & Dust',
  monogram: 'S',
  href: 'games/steel-and-dust/',
  coverSrc: 'games/steel-and-dust/assets/icons/icon-512.png',
  ...overrides,
});

describe('escapeHtml', () => {
  it('escapes every character that can break out of text or an attribute', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('turns other values into text', () => {
    expect(escapeHtml(3)).toBe('3');
  });
});

describe('renderAppIcon', () => {
  it('links the icon to the game path, out of the tab order until selected', () => {
    const html = renderAppIcon(card(), 0);
    expect(html).toContain(
      '<a class="app" href="games/steel-and-dust/" data-game-index="0" tabindex="-1">',
    );
  });

  it('labels the icon with the game title, which is the link text', () => {
    expect(renderAppIcon(card(), 0)).toContain('<span class="app__label">Steel &amp; Dust</span>');
  });

  it('shows the cover as decorative art that cannot be dragged off', () => {
    const html = renderAppIcon(card(), 0);
    expect(html).toContain(
      '<img class="app__art" src="games/steel-and-dust/assets/icons/icon-512.png" alt=""',
    );
    expect(html).toContain('draggable="false"');
  });

  it('loads the first screens of covers at once and the rest lazily', () => {
    expect(renderAppIcon(card(), 0)).toContain('loading="eager"');
    expect(renderAppIcon(card(), EAGER_ICON_COUNT - 1)).toContain('loading="eager"');
    expect(renderAppIcon(card(), EAGER_ICON_COUNT)).toContain('loading="lazy"');
  });

  it('draws the first letter of the title when there is no cover', () => {
    const html = renderAppIcon(card({ coverSrc: '' }), 0);
    expect(html).not.toContain('<img');
    expect(html).toContain('<span class="app__art app__art--monogram" aria-hidden="true">S</span>');
  });

  it('escapes every catalog value', () => {
    const hostile = '<img src=x onerror="alert(1)">';
    const html = renderAppIcon(
      card({
        title: hostile,
        monogram: hostile,
        href: 'games/x/" onclick="alert(1)',
        coverSrc: 'x.png" onerror="alert(1)',
      }),
      0,
    );
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('" onclick="');
    expect(html).not.toContain('" onerror="');
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  });
});

describe('renderAppGrid', () => {
  it('renders one icon per game, numbered in order', () => {
    const html = renderAppGrid([card(), card({ id: 'two', title: 'Two' })]);
    expect(html.match(/data-game-index="\d"/g)).toEqual([
      'data-game-index="0"',
      'data-game-index="1"',
    ]);
    expect(html.match(/<li class="app-slot">/g)).toHaveLength(2);
  });

  it('renders nothing for no games', () => {
    expect(renderAppGrid([])).toBe('');
  });
});

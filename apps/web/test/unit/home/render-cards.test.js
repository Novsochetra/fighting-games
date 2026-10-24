import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../../src/home/escape-html.js';
import {
  EAGER_CARD_COUNT,
  NARROW_MEDIA,
  renderAll,
  renderArt,
  renderBackdrop,
  renderCard,
  renderDot,
  renderTile,
} from '../../../src/home/render-cards.js';

const card = (overrides = {}) => ({
  id: 'steel-and-dust',
  title: 'Steel & Dust',
  monogram: 'S',
  href: 'games/steel-and-dust/',
  coverSrc: 'games/steel-and-dust/assets/icons/icon-512.png',
  bannerSrc: 'games/steel-and-dust/assets/ui/select/bg-landscape.png',
  posterSrc: 'games/steel-and-dust/assets/ui/select/bg-portrait.png',
  genre: "Beat 'em up",
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

describe('renderArt', () => {
  it('shows the banner as decorative art that cannot be dragged off', () => {
    const html = renderArt(card());
    expect(html).toContain(
      '<img class="art" src="games/steel-and-dust/assets/ui/select/bg-landscape.png" alt=""',
    );
    expect(html).toContain('draggable="false"');
  });

  it('draws the first letter of the title when there is no art', () => {
    const html = renderArt(card({ bannerSrc: '' }));
    expect(html).not.toContain('<img');
    expect(html).toBe('<span class="art art--monogram" aria-hidden="true">S</span>');
  });
});

describe('renderCard', () => {
  it('is a button named after the game, out of the tab order until it is the center card', () => {
    const html = renderCard(card(), 0);
    expect(html).toContain(
      '<button class="card" type="button" data-game-index="0" tabindex="-1" aria-label="Steel &amp; Dust">',
    );
    expect(html).toContain('<span class="card__ring" aria-hidden="true"></span>');
  });

  it('loads the cards near the start at once and the rest lazily', () => {
    expect(renderCard(card(), EAGER_CARD_COUNT - 1)).toContain('loading="eager"');
    expect(renderCard(card(), EAGER_CARD_COUNT)).toContain('loading="lazy"');
  });
});

describe('renderTile', () => {
  it('shows the art, title and genre, staggered by its place in the grid', () => {
    const html = renderTile(card(), 4, 2);
    expect(html).toContain('data-game-index="4"');
    expect(html).toContain('style="--order: 2"');
    expect(html).toContain('<span class="tile__title">Steel &amp; Dust</span>');
    expect(html).toContain('<span class="tile__genre">Beat &#39;em up</span>');
  });
});

describe('renderBackdrop', () => {
  it('uses the poster on narrow screens and the banner elsewhere', () => {
    const html = renderBackdrop(card(), 1);
    expect(html).toContain('<picture class="backdrop" data-game-index="1">');
    expect(html).toContain(
      `<source media="${NARROW_MEDIA}" srcset="games/steel-and-dust/assets/ui/select/bg-portrait.png" />`,
    );
    expect(html).toContain('src="games/steel-and-dust/assets/ui/select/bg-landscape.png"');
  });

  it('leaves the backdrop black when the game has no art', () => {
    expect(renderBackdrop(card({ bannerSrc: '' }), 0)).toBe(
      '<div class="backdrop" data-game-index="0"></div>',
    );
  });
});

describe('every renderer', () => {
  const hostile = '<img src=x onerror="alert(1)">';
  const bad = card({
    title: hostile,
    monogram: hostile,
    genre: hostile,
    bannerSrc: 'x.png" onerror="alert(1)',
    posterSrc: 'y.png" onerror="alert(1)',
  });

  it.each([
    ['renderCard', () => renderCard(bad, 0)],
    ['renderTile', () => renderTile(bad, 0, 0)],
    ['renderBackdrop', () => renderBackdrop(bad, 0)],
    ['renderArt', () => renderArt({ ...bad, bannerSrc: '' })],
  ])('%s escapes every catalog value', (_name, render) => {
    const html = render();
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('" onerror="');
  });

  it('renders one dot per game and nothing for no games', () => {
    expect(renderAll([card(), card()], renderDot)).toBe(
      '<span class="pager__dot" data-game-index="0"></span>\n<span class="pager__dot" data-game-index="1"></span>',
    );
    expect(renderAll([], renderDot)).toBe('');
  });
});

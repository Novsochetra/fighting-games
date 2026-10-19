import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../../src/home/escape-html.js';
import { renderEmptySlot, renderGameCard, renderShelf } from '../../../src/home/render-card.js';

const card = (overrides = {}) => ({
  id: 'steel-and-dust',
  title: 'Steel & Dust',
  tagline: 'Pixel brawler',
  description: 'A brawler.',
  genre: "Beat 'em up",
  players: '1 player',
  href: 'games/steel-and-dust/',
  coverSrc: 'games/steel-and-dust/assets/icons/icon-512.png',
  controls: ['Keyboard', 'Gamepad'],
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

describe('renderGameCard', () => {
  it('links the cartridge to the game path', () => {
    const html = renderGameCard(card(), 0);
    expect(html).toContain('<a class="cart" href="games/steel-and-dust/" data-game-index="0"');
  });

  it('shows the title, tagline, facts and control badges', () => {
    const html = renderGameCard(card(), 0);
    expect(html).toContain('<h3 class="cart__title">Steel &amp; Dust</h3>');
    expect(html).toContain('<p class="cart__tagline">Pixel brawler</p>');
    expect(html).toContain('<dt>Genre</dt><dd>Beat &#39;em up</dd>');
    expect(html).toContain('<dt>Players</dt><dd>1 player</dd>');
    expect(html).toContain('<li class="badge">Keyboard</li><li class="badge">Gamepad</li>');
  });

  it('shows the cover as decorative art, because the title names the game', () => {
    const html = renderGameCard(card(), 0);
    expect(html).toContain(
      '<img class="cart__cover" src="games/steel-and-dust/assets/icons/icon-512.png" alt=""',
    );
  });

  it('draws a blank label when there is no cover', () => {
    const html = renderGameCard(card({ coverSrc: '' }), 0);
    expect(html).not.toContain('<img');
    expect(html).toContain('cart__cover--blank');
  });

  it('leaves out empty facts and control lists', () => {
    const html = renderGameCard(card({ genre: '', players: '', controls: [] }), 0);
    expect(html).not.toContain('<dl');
    expect(html).not.toContain('cart__controls');
  });

  it('escapes every catalog value', () => {
    const hostile = '<img src=x onerror="alert(1)">';
    const html = renderGameCard(
      card({
        title: hostile,
        tagline: hostile,
        genre: hostile,
        players: hostile,
        controls: [hostile],
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

describe('renderEmptySlot', () => {
  it('is clearly labeled and cannot be selected or followed', () => {
    const html = renderEmptySlot();
    expect(html).toContain('Coming soon');
    expect(html).toContain('Empty slot');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('data-game-index');
    expect(html).not.toContain('tabindex');
  });
});

describe('renderShelf', () => {
  it('puts the games first and the empty slots after them', () => {
    const html = renderShelf({
      cards: [card(), card({ id: 'two', title: 'Two' })],
      emptySlotCount: 2,
    });
    expect(html.match(/data-game-index="\d"/g)).toEqual([
      'data-game-index="0"',
      'data-game-index="1"',
    ]);
    expect(html.match(/slot--empty/g)).toHaveLength(2);
    expect(html.indexOf('slot--empty')).toBeGreaterThan(html.lastIndexOf('data-game-index'));
  });
});

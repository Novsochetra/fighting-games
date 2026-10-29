// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { CarouselCard, EAGER_CARD_COUNT } from '../../../src/home/Carousel';
import { comingSoonCard } from '../../../src/home/coming-soon.js';
import type { GameCard } from '../../../src/home/game-card';
import { Backdrop, GameArt, NARROW_MEDIA } from '../../../src/home/GameArt';
import { renderInArcade, unmountArcade } from '../../support/render-arcade';

const card = (overrides: Partial<GameCard> = {}): GameCard => ({
  id: 'steel-and-dust',
  title: 'Steel & Dust',
  monogram: 'S',
  href: 'games/steel-and-dust/',
  coverSrc: 'games/steel-and-dust/assets/icons/icon-512.png',
  bannerSrc: 'games/steel-and-dust/assets/ui/select/bg-landscape.png',
  posterSrc: 'games/steel-and-dust/assets/ui/select/bg-portrait.png',
  artSrc: 'games/steel-and-dust/assets/screenshots/angkor-wat.png',
  trailerSrc: '',
  genre: "Beat 'em up",
  meta: '',
  summary: '',
  description: '',
  controls: [],
  ...overrides,
});

// A screen shows under another screen's address too, so every catalog path takes the arcade's root.
const onArcade = (path: string) => new URL(path, window.location.origin).href;

const rendered = (part: React.ReactNode) => renderInArcade(part).container;

afterEach(unmountArcade);

describe('the art of a game', () => {
  it('shows the frame of play as decorative art that cannot be dragged off', () => {
    const img = rendered(<GameArt card={card()} loading="eager" />).querySelector('img')!;

    expect(img.className).toBe('art');
    expect(img.getAttribute('src')).toBe(
      onArcade('games/steel-and-dust/assets/screenshots/angkor-wat.png'),
    );
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('draggable')).toBe('false');
  });

  it('draws the first letter of the title when there is no art', () => {
    const view = rendered(<GameArt card={card({ artSrc: '' })} loading="eager" />);

    expect(view.querySelector('img')).toBeNull();
    expect(view.innerHTML).toBe('<span class="art art--monogram" aria-hidden="true">S</span>');
  });

  it('stays smooth where pixel art scales block by block', () => {
    const smooth = card({ smoothArt: true });

    expect(
      rendered(<GameArt card={smooth} loading="lazy" />).querySelector('img.art.is-smooth'),
    ).not.toBeNull();
    unmountArcade();
    expect(
      rendered(<Backdrop card={smooth} index={0} isActive />).querySelector(
        'img.backdrop__img.is-smooth',
      ),
    ).not.toBeNull();
  });

  it('draws a slate with sparkles and its label for a teaser', () => {
    const view = rendered(<GameArt card={comingSoonCard(1)} loading="eager" />);

    expect(view.querySelector('.art.art--soon[aria-hidden="true"] svg.art__glyph')).not.toBeNull();
    expect(view.querySelector('.art__label')!.textContent).toBe('Coming Soon');
    expect(view.querySelector('img')).toBeNull();
  });
});

describe('a card of the carousel', () => {
  it('is a button named after the game, out of the tab order until it is the center card', () => {
    const button = rendered(<CarouselCard card={card()} index={0} />).querySelector('button')!;

    expect(button.className).toBe('card');
    expect(button.dataset.gameIndex).toBe('0');
    expect(button.tabIndex).toBe(-1);
    expect(button.getAttribute('aria-label')).toBe('Steel & Dust');
    expect(button.querySelector('.card__ring[aria-hidden="true"]')).not.toBeNull();
  });

  it('loads the cards near the start at once and the rest lazily', () => {
    const near = rendered(<CarouselCard card={card()} index={EAGER_CARD_COUNT - 1} />);

    expect(near.querySelector('img')!.getAttribute('loading')).toBe('eager');
    unmountArcade();
    const far = rendered(<CarouselCard card={card()} index={EAGER_CARD_COUNT} />);

    expect(far.querySelector('img')!.getAttribute('loading')).toBe('lazy');
  });
});

describe('the backdrop behind the carousel', () => {
  it('uses the poster on narrow screens and the banner elsewhere', () => {
    const view = rendered(<Backdrop card={card()} index={1} isActive={false} />);
    const source = view.querySelector('picture.backdrop[data-game-index="1"] source')!;

    expect(source.getAttribute('media')).toBe(NARROW_MEDIA);
    expect(source.getAttribute('srcset')).toBe(
      onArcade('games/steel-and-dust/assets/ui/select/bg-portrait.png'),
    );
    expect(view.querySelector('img')!.getAttribute('src')).toBe(
      onArcade('games/steel-and-dust/assets/ui/select/bg-landscape.png'),
    );
  });

  it('leaves the backdrop black with no art, and gives a teaser one of its own', () => {
    expect(
      rendered(<Backdrop card={card({ bannerSrc: '' })} index={0} isActive={false} />).innerHTML,
    ).toBe('<div class="backdrop" data-game-index="0"></div>');
    unmountArcade();
    expect(rendered(<Backdrop card={comingSoonCard(1)} index={3} isActive />).innerHTML).toBe(
      '<div class="backdrop backdrop--soon is-active" data-game-index="3"></div>',
    );
  });
});

describe('catalog values', () => {
  it('stay text, never markup, wherever they show', () => {
    const hostile = '<img src=x onerror="alert(1)">';
    const bad = card({ title: hostile, monogram: hostile, artSrc: '' });
    const view = rendered(
      <>
        <CarouselCard card={bad} index={0} />
        <GameArt card={{ ...bad, isComingSoon: true }} loading="eager" />
      </>,
    );

    expect(view.querySelector('img')).toBeNull();
    expect(view.querySelector('.art--monogram')!.textContent).toBe(hostile);
    expect(view.querySelector('.art__label')!.textContent).toBe(hostile);
  });
});

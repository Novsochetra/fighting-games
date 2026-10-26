import { createCarouselView } from './carousel-view.js';
import { createLayoutSwap } from './layout-swap.js';
import { pickLaunchSource } from './launch-source.js';
import { createLibraryView } from './library-view.js';
import { createSpotlightView } from './spotlight-view.js';

export const LOADING_MESSAGE = 'Loading games…';
export const ERROR_MESSAGE = 'The game list did not load. Check your connection, then try again.';
export const EMPTY_MESSAGE = 'No games yet.';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    home: byId('home'),
    hero: byId('hero'),
    stage: byId('stage'),
    notice: byId('notice'),
    status: byId('status'),
    retry: byId('retry'),
    library: byId('library'),
    carousel: byId('carousel'),
    track: byId('carousel-track'),
    pager: byId('pager'),
    previous: byId('previous'),
    next: byId('next'),
  };
}

function showNotice({ elements, library }, { message, tone }) {
  elements.notice.hidden = false;
  elements.notice.dataset.tone = tone;
  elements.status.textContent = message;
  elements.retry.hidden = tone !== 'error';
  elements.stage.hidden = true;
  library.hide();
}

function showGames({ elements, carousel, spotlight, library }, cards) {
  if (cards.length === 0) {
    showNotice({ elements, library }, { message: EMPTY_MESSAGE, tone: 'empty' });
    return;
  }
  elements.notice.hidden = true;
  elements.status.textContent = '';
  carousel.render(cards);
  spotlight.render(cards);
  elements.stage.hidden = false;
  library.show();
}

export function createHomeView(document) {
  const elements = findElements(document);
  const { track, pager, previous, next } = elements;
  const parts = {
    elements,
    carousel: createCarouselView({ track, pager, arrows: [previous, next] }),
    spotlight: createSpotlightView(document),
    library: createLibraryView(document),
  };
  // the stage fades in on its own (stage-enter in hero.css), so only the notice and the library swap
  const swap = createLayoutSwap([elements.notice, elements.library]);
  const select = (index, card, { animate = false, focus = null } = {}) => {
    parts.carousel.select(index, { focus: focus === 'carousel' });
    parts.spotlight.show(card, index, { animate });
    parts.library.select(index, { focus: focus === 'library' });
  };
  return {
    ...parts,
    showLoading: () => swap(() => showNotice(parts, { message: LOADING_MESSAGE, tone: 'loading' })),
    showError: () => swap(() => showNotice(parts, { message: ERROR_MESSAGE, tone: 'error' })),
    showGames: (cards) => swap(() => showGames(parts, cards)),
    select,
    revealHero: () => elements.hero.scrollIntoView?.({ block: 'start' }),
    findLaunchSource: (index) =>
      pickLaunchSource(
        [parts.carousel.frameAt(index), parts.library.frameAt(index)],
        document.defaultView.innerHeight,
      ),
  };
}

// Teaser cards close the carousel's loop until more games arrive: they show and move like games but
// cannot be opened, favorited or found in the library.
export const COMING_SOON_COUNT = 2;
export const COMING_SOON_TITLE = 'Coming Soon';

export function comingSoonCard(number) {
  return {
    id: `coming-soon-${number}`,
    title: COMING_SOON_TITLE,
    monogram: '',
    href: '',
    coverSrc: '',
    bannerSrc: '',
    posterSrc: '',
    artSrc: '',
    trailerSrc: '',
    genre: 'In development',
    meta: 'New game · In development',
    summary: 'A new game is on its way to the arcade.',
    description: '',
    controls: [],
    isComingSoon: true,
  };
}

// No teasers on an empty arcade: they would promise games around nothing to play.
export function withComingSoon(cards, count = COMING_SOON_COUNT) {
  if (cards.length === 0) {
    return cards;
  }
  const teasers = Array.from({ length: count }, (_, i) => comingSoonCard(i + 1));
  return [...cards, ...teasers];
}

export const isPlayable = (card) => !card.isComingSoon;

// A game as the arcade shows it (view-models.js), or a teaser closing the carousel's loop
// (coming-soon.js).
export interface GameCard {
  id: string;
  title: string;
  monogram: string;
  href: string;
  smoothArt?: boolean;
  coverSrc: string;
  bannerSrc: string;
  posterSrc: string;
  artSrc: string;
  // a video of play the details sheet shows, or '' for a game without one
  trailerSrc: string;
  genre: string;
  meta: string;
  summary: string;
  description: string;
  controls: string[];
  isComingSoon?: boolean;
}

export type FocusZone = 'carousel' | 'library' | null;

export type LaunchSource = 'play_button' | 'details' | 'card' | 'keyboard' | 'gamepad';

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
  trailerSrc: string;
  trailerSmallSrc: string;
  genre: string;
  meta: string;
  summary: string;
  description: string;
  controls: string[];
  // a game with an online leaderboard (leaderboard/board-rules.js)
  board?: GameBoard | null;
  isComingSoon?: boolean;
}

export interface GameBoard {
  heroes: Record<string, string>;
  difficulties: string[];
}

export type FocusZone = 'carousel' | 'library' | null;

export type LaunchSource = 'play_button' | 'details' | 'card' | 'keyboard' | 'gamepad';

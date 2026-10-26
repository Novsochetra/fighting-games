import type { ScreenId } from './screens';

export interface ScreenHead {
  title: string;
  description: string;
  canonical: string;
}

// Each page's head names its screen for search and link previews; as the arcade changes screens in
// the page, it names the screen on top the same way. A test holds these to the pages' own heads.
export const SCREEN_HEADS: Record<ScreenId, ScreenHead> = {
  home: {
    title: 'Retro Arcade · Free Khmer games in your browser',
    description:
      'Free retro games inspired by Cambodia, right in your browser: fight to the temples of Angkor in Steel & Dust, or explore them in Morodok Angkor.',
    canonical: 'https://www.khmerarcade.games/',
  },
  supporters: {
    title: 'Supporters · Retro Arcade',
    description: 'The people who keep every game in the arcade free to play.',
    canonical: 'https://www.khmerarcade.games/supporters/',
  },
  credits: {
    title: 'Credits · Retro Arcade',
    description:
      'Nov Sochetra makes Retro Arcade, free Khmer games in your browser. Find them on Buy Me a Coffee, GitHub and Facebook.',
    canonical: 'https://www.khmerarcade.games/credits/',
  },
};

export function applyHead(document: Document, { title, description, canonical }: ScreenHead) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
}

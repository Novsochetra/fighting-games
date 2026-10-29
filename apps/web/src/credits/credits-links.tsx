import type { ReactNode } from 'react';
import { HeartIcon } from '../arcade/icons';

export interface CreditsLink {
  title: string;
  detail: string;
  // a tile in its service's color (tiles.css)
  tile: 'coffee' | 'github' | 'facebook' | 'heart' | 'type' | 'voice';
  icon: ReactNode;
  // another site, which opens in a tab, or a screen of the arcade
  href?: string;
  screen?: string;
  id?: string;
}

const svg = (kind: 'bold' | 'solid', viewBox: string, children: ReactNode) => (
  <svg className={`icon icon--${kind}`} viewBox={viewBox}>
    {children}
  </svg>
);

const COFFEE = svg(
  'bold',
  '0 0 24 24',
  <>
    <path d="M4.5 9.5h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
    <path d="M15.5 11h1.25a2.25 2.25 0 0 1 0 4.5H15" />
    <path d="M8 3.5c-.7.9-.7 1.8 0 2.7M11.5 3.5c-.7.9-.7 1.8 0 2.7" />
  </>,
);

const GITHUB = svg(
  'solid',
  '0 0 16 16',
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />,
);

const FACEBOOK = svg(
  'solid',
  '0 0 24 24',
  <path d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21z" />,
);

const VOICE = svg(
  'bold',
  '0 0 24 24',
  <path d="M4.5 10v4M8.25 7v10M12 4v16M15.75 8v8M19.5 10.5v3" />,
);

export const FIND_ME: CreditsLink[] = [
  {
    title: 'Buy Me a Coffee',
    detail: 'sochetranov',
    tile: 'coffee',
    icon: COFFEE,
    href: 'https://buymeacoffee.com/sochetranov',
  },
  {
    title: 'GitHub',
    detail: '@Novsochetra',
    tile: 'github',
    icon: GITHUB,
    href: 'https://github.com/Novsochetra',
  },
  {
    title: 'Facebook',
    detail: 'sochetra.nov.7',
    tile: 'facebook',
    icon: FACEBOOK,
    href: 'https://www.facebook.com/sochetra.nov.7',
  },
  {
    title: 'Facebook',
    detail: 'Morodok Angkor',
    tile: 'facebook',
    icon: FACEBOOK,
    href: 'https://www.facebook.com/profile.php?id=61594987526699',
  },
];

export const THANKS_TO: CreditsLink[] = [
  {
    title: 'Supporters',
    detail: 'They keep every game free',
    tile: 'heart',
    icon: <HeartIcon />,
    screen: '/supporters/',
    id: 'credits-supporters-link',
  },
];

export const MADE_WITH: CreditsLink[] = [
  {
    title: 'Inter',
    detail: 'Type, by Rasmus Andersson',
    tile: 'type',
    icon: 'Aa',
    href: 'https://rsms.me/inter/',
  },
  {
    title: 'Kokoro',
    detail: "The announcer's voice",
    tile: 'voice',
    icon: VOICE,
    href: 'https://huggingface.co/hexgrad/Kokoro-82M',
  },
];

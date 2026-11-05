import type { ReactNode } from 'react';
import { HeartIcon } from '@/components/icons';

export interface CreditsLink {
  title: string;
  detail: string;
  // a tile in its service's color (tiles.css)
  tile: 'coffee' | 'github' | 'youtube' | 'x' | 'tiktok' | 'facebook' | 'heart' | 'type' | 'voice';
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

const YOUTUBE = svg(
  'solid',
  '0 0 24 24',
  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12z" />,
);

const X_LOGO = svg(
  'solid',
  '0 0 24 24',
  <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.25 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z" />,
);

const TIKTOK = svg(
  'solid',
  '0 0 24 24',
  <path d="M12.53.02c1.3-.02 2.6-.01 3.9-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />,
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
    title: 'YouTube',
    detail: '@sochetranov',
    tile: 'youtube',
    icon: YOUTUBE,
    href: 'https://www.youtube.com/@sochetranov',
  },
  {
    title: 'X',
    detail: '@Sochetra_NOV',
    tile: 'x',
    icon: X_LOGO,
    href: 'https://x.com/Sochetra_NOV',
  },
  {
    title: 'TikTok',
    detail: '@chetra566',
    tile: 'tiktok',
    icon: TIKTOK,
    href: 'https://www.tiktok.com/@chetra566',
  },
  {
    title: 'Facebook',
    detail: 'sochetra.nov.7',
    tile: 'facebook',
    icon: FACEBOOK,
    href: 'https://www.facebook.com/sochetra.nov.7',
  },
  {
    title: 'Morodok Angkor',
    detail: 'Facebook page',
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

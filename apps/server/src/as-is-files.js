import path from 'node:path';
import { GAMES_ROOT, PACKAGES_ROOT, PUBLIC_ROOT } from './paths.js';

// Past Vite: each game is an app of its own, a crawler asks for robots.txt and sitemap.xml by name,
// and appearance-early.js is a classic script that must run before the first paint, which Vite
// would not bundle.
export const AS_IS = ['games', 'assets', 'robots.txt', 'sitemap.xml', 'appearance-early.js'];

// The packages the games share: the build joins them into each game's own bundles, so only
// npm run dev, which serves a game's modules as they are written, sends them.
export const DEV_ONLY_AS_IS = ['packages'];

const SOURCE_ROOTS = new Map([
  ['games', GAMES_ROOT],
  ['packages', PACKAGES_ROOT],
]);

export const sourceOfAsIs = (entry) => SOURCE_ROOTS.get(entry) ?? path.join(PUBLIC_ROOT, entry);

export const AS_IS_SOURCES = new Map(
  [...AS_IS, ...DEV_ONLY_AS_IS].map((entry) => [entry, sourceOfAsIs(entry)]),
);

const isUnder = (entries, pathname) =>
  entries.some((entry) => pathname === `/${entry}` || pathname.startsWith(`/${entry}/`));

export const isServedAsIs = (pathname) => isUnder(AS_IS, pathname);

export const isServedAsIsInDev = (pathname) =>
  isServedAsIs(pathname) || isUnder(DEV_ONLY_AS_IS, pathname);

// Where Vite puts the modules and stylesheets it builds, each named by its content.
export const BUILD_FOLDER = 'build';

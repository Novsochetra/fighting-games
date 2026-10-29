// The arcade's screens and where each lives under the arcade. The arcade is the root of the stack;
// the leaderboard, the supporters and the credits are pushed over it, as screens of an iOS
// navigation stack. Each also has a page of its own on disk, which a visitor can open directly.
export const SCREENS = [
  { id: 'home', path: '', depth: 0 },
  { id: 'leaderboard', path: 'leaderboard/', depth: 1 },
  { id: 'supporters', path: 'supporters/', depth: 1 },
  { id: 'credits', path: 'credits/', depth: 1 },
] as const;

export type ScreenId = (typeof SCREENS)[number]['id'];

const screenById = (id: ScreenId) => SCREENS.find((screen) => screen.id === id)!;

export const depthOf = (id: ScreenId) => screenById(id).depth;
export const routeOf = (id: ScreenId) => `/${screenById(id).path}`;
export const isScreenId = (id: unknown): id is ScreenId =>
  SCREENS.some((screen) => screen.id === id);

// The arcade sits a folder above a screen under it, at whatever path it is served from.
export function arcadeRoot(pageUrl: URL, screen: ScreenId): URL {
  const depth = screenById(screen).path.split('/').filter(Boolean).length;

  return new URL('../'.repeat(depth) || './', pageUrl);
}

// A route under the arcade's root, with or without its index.html, names its screen; anything else
// (a game, a file) names none.
export function screenAtRoute(pathname: string): ScreenId | null {
  const path = pathname.replace(/^\//, '').replace(/(^|\/)index\.html$/, '$1');
  const withSlash = path === '' || path.endsWith('/') ? path : `${path}/`;

  return SCREENS.find((screen) => screen.path === withSlash)?.id ?? null;
}

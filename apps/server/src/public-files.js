import path from 'node:path';

const HIDDEN_NAMES = new Set(['test', 'node_modules', 'package.json', 'package-lock.json']);

// Lower-cased because macOS and Windows file systems ignore case, so /TEST/ would reach test/.
export function isHiddenName(name) {
  return name.startsWith('.') || HIDDEN_NAMES.has(name.toLowerCase());
}

// A file is published (served, built or kept offline) unless a folder on its way is hidden.
export function isPublishedPath(webRoot, sourcePath) {
  const relative = path.relative(webRoot, sourcePath);

  return relative === '' || relative.split(path.sep).every((name) => !isHiddenName(name));
}

// a game's dev/ folder holds the pages it is worked on with, such as Naga Eleven's camera lab:
// npm run dev serves them as it serves the rest, and the build leaves them out, so no player ever
// loads one or downloads it for offline
export function isGameDevPath(gamesRoot, sourcePath) {
  const [, folder] = path.relative(gamesRoot, sourcePath).split(path.sep);

  return folder === 'dev';
}

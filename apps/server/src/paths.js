import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Built with node:path instead of new URL(...) because test DOMs such as happy-dom replace the
// global URL with one that resolves against a fake http origin.
const SOURCE_FOLDER = path.dirname(fileURLToPath(import.meta.url));

export const WEB_ROOT = path.resolve(SOURCE_FOLDER, '../../web');
export const ARCADE_ROOT = path.join(WEB_ROOT, 'arcade');
export const ARCADE_SRC = path.join(ARCADE_ROOT, 'src');
export const PAGES_ROOT = path.join(ARCADE_ROOT, 'pages');
export const PUBLIC_ROOT = path.join(ARCADE_ROOT, 'public');
export const GAMES_ROOT = path.join(WEB_ROOT, 'games');
// The packages the games share (input: the gamepad, keys, rumble), joined into each game by the build.
export const PACKAGES_ROOT = path.join(WEB_ROOT, 'packages');
export const DIST_ROOT = path.resolve(SOURCE_FOLDER, '../../../dist');
// The arcade's package.json, whose version is the arcade's release (build-version.js).
export const ARCADE_PACKAGE = path.resolve(SOURCE_FOLDER, '../../../package.json');

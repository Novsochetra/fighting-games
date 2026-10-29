import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Built with node:path instead of new URL(...) because test DOMs such as happy-dom replace the
// global URL with one that resolves against a fake http origin.
const SOURCE_FOLDER = path.dirname(fileURLToPath(import.meta.url));

export const WEB_ROOT = path.resolve(SOURCE_FOLDER, '../../web');
export const GAMES_ROOT = path.join(WEB_ROOT, 'games');
// The packages the games share (input: the gamepad, keys, rumble), joined into each game by the build.
export const PACKAGES_ROOT = path.join(WEB_ROOT, 'packages');
// What npm run build writes (apps/web/vite.config.ts), which npm start serves.
export const DIST_ROOT = path.resolve(SOURCE_FOLDER, '../../../dist');
// The arcade's package.json, whose version is the arcade's release (build-version.js).
export const ARCADE_PACKAGE = path.resolve(SOURCE_FOLDER, '../../../package.json');

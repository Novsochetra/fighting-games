import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite } from '../apps/server/src/static-site/build-site.js';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const outDir = path.resolve(process.argv[2] ?? path.join(repoRoot, 'dist'));

const catalog = await buildSite({ outDir });
const count = catalog.games.length;
console.log(`Built the static site in ${outDir} with ${count} ${count === 1 ? 'game' : 'games'}`);

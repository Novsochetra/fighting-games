import { afterEach, describe, expect, it } from 'vitest';
import { versionedSite, versionIn } from '../support/module-site.js';

// after a deploy the game hung at 97% on the loading screen: Pages lets a browser keep any file for
// ten minutes, so a new common.js was linked against an old cached hit-sound.js that lacked the
// playUltStrike it imports. A module's new content must reach the browser under a URL no cache holds
const BEFORE = {
  'index.html': '<script type="module" src="src/main.js"></script>',
  'src/main.js': "import { hitEveryTarget } from './common.js';\n",
  'src/common.js':
    "import { playHitSound } from './hit-sound.js';\nexport const hitEveryTarget = playHitSound;\n",
  'src/hit-sound.js': 'export function playHitSound() {}\n',
};
const AFTER = {
  ...BEFORE,
  'src/common.js':
    "import { playUltStrike } from './hit-sound.js';\nexport const hitEveryTarget = playUltStrike;\n",
  'src/hit-sound.js': 'export function playHitSound() {}\nexport function playUltStrike() {}\n',
};

let sites = [];
afterEach(async () => {
  await Promise.all(sites.map((site) => site.remove()));
  sites = [];
});

describe('a deploy that adds an export and the import that needs it', () => {
  it('asks for the new hit-sound.js under a URL the deploy before never used', async () => {
    const before = await versionedSite(BEFORE);
    const after = await versionedSite(AFTER);
    sites.push(before, after);
    const oldUrl = versionIn(await before.read('src/common.js'), './hit-sound.js');
    const newUrl = versionIn(await after.read('src/common.js'), './hit-sound.js');
    expect(newUrl).not.toBe(oldUrl);
    const oldMain = versionIn(await before.read('index.html'), 'src/main.js');
    expect(versionIn(await after.read('index.html'), 'src/main.js')).not.toBe(oldMain);
  });
});

import { copyFile, cp, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { versionIcons } from '../../../build-steps/version-icons.js';
import { GAMES_ROOT } from '../../../../../server/src/paths.js';

// Bug: Steel & Dust's icons were redrawn at the same addresses. Browsers keep a tab's icon by its
// address, apart from the files they cache, so the game's tab showed the old icon first, or kept it.
const SOURCE = path.join(GAMES_ROOT, 'steel-and-dust');
let gameRoot = '';

const pagePath = () => path.join(gameRoot, 'index.html');
const iconFile = (name) => path.join(gameRoot, 'assets', 'icons', name);
const linkedIcons = (page) =>
  [...page.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)].map(
    (match) => match[1],
  );

async function builtIcons() {
  await copyFile(path.join(SOURCE, 'index.html'), pagePath());
  await versionIcons(pagePath());

  return linkedIcons(await readFile(pagePath(), 'utf8'));
}

beforeAll(async () => {
  gameRoot = await mkdtemp(path.join(tmpdir(), 'redrawn-icon-'));
  await cp(path.join(SOURCE, 'assets', 'icons'), path.join(gameRoot, 'assets', 'icons'), {
    recursive: true,
  });
});

afterAll(() => rm(gameRoot, { recursive: true, force: true }));

describe('a game icon redrawn at the same file', () => {
  it('gets a new address, and the icons not redrawn keep theirs', async () => {
    const before = await builtIcons();

    await copyFile(iconFile('icon-192.png'), iconFile('icon-32.png'));
    const after = await builtIcons();

    expect(after[0]).not.toBe(before[0]);
    expect(after.slice(1)).toEqual(before.slice(1));
  });

  it('still names files the game has', async () => {
    const icons = await builtIcons();

    expect(icons).toHaveLength(3);

    for (const icon of icons) {
      expect(icon).toMatch(/\?v=\w+$/);
      await expect(stat(path.join(gameRoot, icon.split('?')[0]))).resolves.toBeTruthy();
    }
  });
});
